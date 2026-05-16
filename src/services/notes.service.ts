import { conflict, forbidden, notFound } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { serializeNote, type NoteRecord } from "../lib/serialize";

type Pagination = {
  skip: number;
  limit: number;
};

type NoteInput = {
  title: string;
  content: string;
};

type NoteTextFilter = {
  contains: string;
  mode: "insensitive";
};

type NoteWhereInput = {
  id?: string;
  ownerId?: string;
  isArchived?: boolean;
  AND?: NoteWhereInput[];
  OR?: NoteWhereInput[];
  shares?: {
    some: {
      sharedWithUserId?: string;
    };
  };
  title?: NoteTextFilter;
  content?: NoteTextFilter;
};

type SharedArchiveRow = {
  note_id: string;
  is_archived: boolean;
};

const accessibleWhere = (userId: string): NoteWhereInput => ({
  OR: [
    { ownerId: userId },
    { shares: { some: { sharedWithUserId: userId } } }
  ]
});

const getAccess = (noteOwnerId: string, userId: string) =>
  noteOwnerId === userId ? "owner" : "shared";

const getSharedArchiveMap = async (userId: string, noteIds: string[]) => {
  if (noteIds.length === 0) {
    return new Map<string, boolean>();
  }

  const rows = await prisma.$queryRaw<SharedArchiveRow[]>`
    SELECT note_id, is_archived
    FROM note_shares
    WHERE shared_with_user_id = ${userId}
      AND note_id = ANY(${noteIds})
  `;

  return new Map(rows.map((row) => [row.note_id, row.is_archived]));
};

const getUserArchiveState = (
  note: NoteRecord,
  userId: string,
  sharedArchiveMap: Map<string, boolean>
) => {
  if (note.ownerId === userId) {
    return note.isArchived;
  }

  return sharedArchiveMap.get(note.id) ?? false;
};

export const listNotes = async (
  userId: string,
  pagination: Pagination,
  isArchived?: boolean
) => {
  const where: NoteWhereInput = {
    AND: [accessibleWhere(userId)]
  };

  const notes: NoteRecord[] = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" }
  });

  const sharedArchiveMap = await getSharedArchiveMap(
    userId,
    notes.filter((note) => note.ownerId !== userId).map((note) => note.id)
  );

  const filteredNotes = notes.filter((note) => {
    if (isArchived === undefined) {
      return true;
    }

    return getUserArchiveState(note, userId, sharedArchiveMap) === isArchived;
  });

  const paginatedNotes = filteredNotes.slice(
    pagination.skip,
    pagination.skip + pagination.limit
  );

  return {
    data: paginatedNotes.map((note: NoteRecord) =>
      serializeNote(
        note,
        getAccess(note.ownerId, userId),
        getUserArchiveState(note, userId, sharedArchiveMap)
      )
    ),
    pagination: {
      total: filteredNotes.length,
      limit: pagination.limit,
      page: Math.floor(pagination.skip / pagination.limit) + 1
    }
  };
};

export const getAccessibleNote = async (noteId: string, userId: string) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ...accessibleWhere(userId)
    }
  });

  if (!note) {
    throw notFound("Note not found");
  }

  const sharedArchiveMap = await getSharedArchiveMap(userId, [note.id]);

  return serializeNote(
    note,
    getAccess(note.ownerId, userId),
    getUserArchiveState(note, userId, sharedArchiveMap)
  );
};

export const createNote = async (userId: string, input: NoteInput) => {
  const note = await prisma.note.create({
    data: {
      ownerId: userId,
      title: input.title,
      content: input.content
    }
  });

  return serializeNote(note, "owner");
};

const getOwnedNote = async (noteId: string, userId: string) => {
  const note = await prisma.note.findUnique({
    where: { id: noteId }
  });

  if (!note) {
    throw notFound("Note not found");
  }

  if (note.ownerId !== userId) {
    throw forbidden("Only the note owner can perform this action");
  }

  return note;
};

export const updateNote = async (
  noteId: string,
  userId: string,
  input: NoteInput
) => {
  await getOwnedNote(noteId, userId);

  const note = await prisma.note.update({
    where: { id: noteId },
    data: {
      title: input.title,
      content: input.content
    }
  });

  return serializeNote(note, "owner");
};

export const deleteNote = async (noteId: string, userId: string) => {
  await getOwnedNote(noteId, userId);

  await prisma.note.delete({
    where: { id: noteId }
  });
};

export const shareNote = async (
  noteId: string,
  ownerId: string,
  shareWithEmail: string
) => {
  await getOwnedNote(noteId, ownerId);

  const shareWithUser = await prisma.user.findUnique({
    where: { email: shareWithEmail.trim().toLowerCase() }
  });

  if (!shareWithUser) {
    throw notFound("User to share with not found");
  }

  if (shareWithUser.id === ownerId) {
    throw conflict("You cannot share a note with yourself");
  }

  const existingShare = await prisma.noteShare.findUnique({
    where: {
      noteId_sharedWithUserId: {
        noteId,
        sharedWithUserId: shareWithUser.id
      }
    }
  });

  if (existingShare) {
    throw conflict("Note is already shared with this user");
  }

  await prisma.noteShare.create({
    data: {
      noteId,
      sharedWithUserId: shareWithUser.id
    }
  });

  return { message: "Note shared successfully" };
};

export const setArchiveState = async (
  noteId: string,
  userId: string,
  isArchived: boolean
) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ...accessibleWhere(userId)
    }
  });

  if (!note) {
    throw notFound("Note not found");
  }

  if (note.ownerId === userId) {
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { isArchived }
    });

    return serializeNote(updatedNote, "owner", isArchived);
  }

  await prisma.$executeRaw`
    UPDATE note_shares
    SET is_archived = ${isArchived}
    WHERE note_id = ${noteId}
      AND shared_with_user_id = ${userId}
  `;

  return serializeNote(note, "shared", isArchived);
};

export const searchNotes = async (
  userId: string,
  query: string,
  pagination: Pagination,
  isArchived?: boolean
) => {
  const where: NoteWhereInput = {
    AND: [
      accessibleWhere(userId),
      {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } }
        ]
      }
    ]
  };

  const notes: NoteRecord[] = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" }
  });

  const sharedArchiveMap = await getSharedArchiveMap(
    userId,
    notes.filter((note) => note.ownerId !== userId).map((note) => note.id)
  );

  const filteredNotes = notes.filter((note) => {
    if (isArchived === undefined) {
      return true;
    }

    return getUserArchiveState(note, userId, sharedArchiveMap) === isArchived;
  });

  const paginatedNotes = filteredNotes.slice(
    pagination.skip,
    pagination.skip + pagination.limit
  );

  return {
    data: paginatedNotes.map((note: NoteRecord) =>
      serializeNote(
        note,
        getAccess(note.ownerId, userId),
        getUserArchiveState(note, userId, sharedArchiveMap)
      )
    ),
    pagination: {
      total: filteredNotes.length,
      limit: pagination.limit,
      page: Math.floor(pagination.skip / pagination.limit) + 1
    }
  };
};
