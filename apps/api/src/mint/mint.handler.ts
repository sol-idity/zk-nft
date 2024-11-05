import { getAppHono } from "../common/utils/get-app-hono.util";
import { mintRoute } from "./mint.route";
import { Keypair } from "@solana/web3.js";
import { buildMintTx } from "./mint.utils";
import { checkMintEligibility } from "./mint.middleware";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import { Bindings } from "../common/types/bindings";

const app = getAppHono();

app.use(
  mintRoute.getRoutingPath(),
  cloudflareRateLimiter<{
    Bindings: Bindings;
  }>({
    rateLimitBinding: (c) => c.env.MINT_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  })
);
// app.use(mintRoute.getRoutingPath(), checkMintEligibility);

// app.openapi(mintRoute, async (c) => {
//   const { recipient } = c.req.valid("json");
//   const updateAuthority = Keypair.fromSecretKey(
//     Uint8Array.from(JSON.parse(c.env.UPDATE_AUTHORITY_KEYPAIR))
//   );

//   const result = await buildMintTx({
//     recipient,
//     rpc: c.get("rpc"),
//     updateAuthority,
//   });

//   return c.json(result);
// });

export default app;
