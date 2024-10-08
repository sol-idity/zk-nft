import { createRoute } from "@hono/zod-openapi";
import { StakeSchema } from "../common/schemas/stake.schema";
import { InstructionsResponseSchema } from "../common/schemas/instructions-response.schema";

export const stakeRoute = createRoute({
  description: "Stake zkNFT",
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: StakeSchema,
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
      description: "Returns a transaction that you can use to stake your zkNFT.",
    },
  },
});
