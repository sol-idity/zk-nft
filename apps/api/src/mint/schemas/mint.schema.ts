import { z } from "@hono/zod-openapi";
import { refinePublicKey } from "../../common/utils/refine-public-key.util";

export const MintSchema = z.object({
  recipient: z
    .string()
    .refine(refinePublicKey, {
      message: "recipient is not a valid Solana public key.",
    })
    .openapi({
      example: "4uJ52K5Wn1nn2StHak9VfKuDcKC7nZXH4ynF2zUCxhGJ",
    }),
});
