import { z } from "@hono/zod-openapi";
import { refinePublicKey } from "../utils/refine-public-key.util";

export const StakeSchema = z.object({
  owner: z
    .string()
    .refine(refinePublicKey, {
      message: "owner is not a valid Solana public key.",
    })
    .openapi({
      example: "4uJ52K5Wn1nn2StHak9VfKuDcKC7nZXH4ynF2zUCxhGJ",
    }),
  assetId: z
    .string()
    .refine(refinePublicKey, {
      message: "assetId is not a valid base58 string.",
    })
    .openapi({
      example: "13ZC2sYQDfR7Whj3rAiAwjbNViKsQrNbkwpf3QEtXYQp",
    }),
});
