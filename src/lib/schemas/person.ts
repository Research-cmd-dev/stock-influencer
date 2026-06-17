import { z } from "zod";
import { IdSchema, UrlSchema } from "./common";

/** An influential AI/tech executive tracked by the platform. */
export const PersonSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  role: z.string().min(1),
  company: z.string().min(1),
  ticker: z.string().min(1).max(8).optional(),
  photoUrl: UrlSchema.optional(),
  xHandle: z
    .string()
    .regex(/^@?[A-Za-z0-9_]{1,15}$/, "invalid X handle")
    .optional(),
  bio: z.string().max(2000).optional(),
});

export type Person = z.infer<typeof PersonSchema>;

/** Shape for creating a person (id assigned by the store). */
export const PersonInputSchema = PersonSchema.omit({ id: true });
export type PersonInput = z.infer<typeof PersonInputSchema>;
