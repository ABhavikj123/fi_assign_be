import { z } from "zod";

export const noteBodySchema = z.object({
  title: z.string().trim().min(1).max(160),
  content: z.string().trim().min(1).max(10000)
});

export const shareBodySchema = z.object({
  share_with_email: z.string().trim().email().max(255)
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200)
});
