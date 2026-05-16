import { Router } from "express";
import {
  archiveNote,
  getNoteById,
  getNotes,
  postNote,
  postShareNote,
  putNote,
  removeNote,
  search,
  unarchiveNote
} from "../controllers/notes.controller";
import { asyncHandler } from "../lib/async-handler";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { noteBodySchema, shareBodySchema } from "../validators/notes";

export const notesRouter = Router();

notesRouter.use(requireAuth);

notesRouter.get("/notes", asyncHandler(getNotes));
notesRouter.post("/notes", validate(noteBodySchema, "body"), asyncHandler(postNote));
notesRouter.get("/notes/:id", asyncHandler(getNoteById));
notesRouter.put("/notes/:id", validate(noteBodySchema, "body"), asyncHandler(putNote));
notesRouter.delete("/notes/:id", asyncHandler(removeNote));
notesRouter.post(
  "/notes/:id/share",
  validate(shareBodySchema, "body"),
  asyncHandler(postShareNote)
);
notesRouter.patch("/notes/:id/archive", asyncHandler(archiveNote));
notesRouter.patch("/notes/:id/unarchive", asyncHandler(unarchiveNote));
notesRouter.get("/search", asyncHandler(search));
