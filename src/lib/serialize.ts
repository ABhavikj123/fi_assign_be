export type SerializedNote = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  is_archived?: boolean;
  access?: "owner" | "shared";
};

export type NoteRecord = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const serializeNote = (
  note: NoteRecord,
  access?: "owner" | "shared",
  isArchived = note.isArchived
): SerializedNote => ({
  id: note.id,
  title: note.title,
  content: note.content,
  created_at: note.createdAt.toISOString(),
  updated_at: note.updatedAt.toISOString(),
  owner_id: note.ownerId,
  is_archived: isArchived,
  access
});
