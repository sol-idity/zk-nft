import { z } from "@hono/zod-openapi";

export const ErrorResponseSchema = z.object({
  message: z.string().openapi({
    description: "Error message reason.",
  }),
});
