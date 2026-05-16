import type { Request, Response } from "express";
import { env } from "../config/env";
import { openApiDocument } from "../docs/openapi";

export const about = (_req: Request, res: Response) =>
  res.status(200).json({
    name: env.ABOUT_NAME,
    email: env.ABOUT_EMAIL,
    "my features": {
      "Archive Notes":
        "Users can archive notes instead of deleting them. I chose this because notes apps often need a safe way to hide old notes without permanently losing useful information.",
      "Search Notes":
        "Users can search across note titles and content. I chose this because a notes app becomes difficult to use as the number of notes grows, and search makes retrieval fast and practical."
    }
  });

export const openApi = (_req: Request, res: Response) =>
  res.status(200).json(openApiDocument);
