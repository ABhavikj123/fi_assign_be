import type { Request, Response } from "express";
import { archivedQuerySchema, uuidParamSchema } from "../validators/common";
import { searchQuerySchema } from "../validators/notes";
import { getPagination } from "../lib/pagination";
import {
  createNote,
  deleteNote,
  getAccessibleNote,
  listNotes,
  searchNotes,
  setArchiveState,
  shareNote,
  updateNote
} from "../services/notes.service";

const requireUserId = (req: Request) => req.user!.id;

const parseNoteId = (req: Request) => uuidParamSchema.parse(req.params).id;

const parseArchived = (req: Request) =>
  archivedQuerySchema.parse(req.query).archived;

export const getNotes = async (req: Request, res: Response) => {
  const result = await listNotes(
    requireUserId(req),
    getPagination(req.query),
    parseArchived(req)
  );
  return res.status(200).json(result.data);
};

export const getNoteById = async (req: Request, res: Response) => {
  const note = await getAccessibleNote(parseNoteId(req), requireUserId(req));
  return res.status(200).json(note);
};

export const postNote = async (req: Request, res: Response) => {
  const note = await createNote(requireUserId(req), req.body);
  return res.status(201).json(note);
};

export const putNote = async (req: Request, res: Response) => {
  const note = await updateNote(parseNoteId(req), requireUserId(req), req.body);
  return res.status(200).json(note);
};

export const removeNote = async (req: Request, res: Response) => {
  await deleteNote(parseNoteId(req), requireUserId(req));
  return res.status(204).send();
};

export const postShareNote = async (req: Request, res: Response) => {
  const result = await shareNote(
    parseNoteId(req),
    requireUserId(req),
    req.body.share_with_email
  );
  return res.status(200).json(result);
};

export const archiveNote = async (req: Request, res: Response) => {
  const note = await setArchiveState(parseNoteId(req), requireUserId(req), true);
  return res.status(200).json(note);
};

export const unarchiveNote = async (req: Request, res: Response) => {
  const note = await setArchiveState(parseNoteId(req), requireUserId(req), false);
  return res.status(200).json(note);
};

export const search = async (req: Request, res: Response) => {
  const { q } = searchQuerySchema.parse(req.query);
  const result = await searchNotes(
    requireUserId(req),
    q,
    getPagination(req.query),
    parseArchived(req)
  );
  return res.status(200).json(result.data);
};
