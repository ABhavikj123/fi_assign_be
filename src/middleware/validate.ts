import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { badRequest } from "../lib/errors";

type RequestPart = "body" | "params" | "query";

export const validate =
  (schema: ZodSchema, part: RequestPart) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      return next(
        badRequest(
          "Validation failed",
          result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        )
      );
    }

    req[part] = result.data;
    return next();
  };
