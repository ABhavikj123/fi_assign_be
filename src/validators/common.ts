import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid note id")
});

export const archivedQuerySchema = z.object({
  archived: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    })
});
