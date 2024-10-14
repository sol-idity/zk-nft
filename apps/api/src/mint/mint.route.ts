import { createRoute } from "@hono/zod-openapi";
import { InstructionsResponseSchema } from "../common/schemas/instructions-response.schema";
import { MintSchema } from "./schemas/mint.schema";

export const mintRoute = createRoute({
  description: "Mint zkNFT",
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: MintSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: InstructionsResponseSchema,
        },
      },
      description: "Returns a transaction that you can use to mint a zkNFT.",
    },
  },
});
