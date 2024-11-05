import { createMiddleware } from "hono/factory";
import { Bindings } from "../common/types/bindings";
import { Variables } from "../common/types/variables";
import { ConfirmedSignatureInfo, Connection, PublicKey } from "@solana/web3.js";
import { HTTPException } from "hono/http-exception";

export const checkMintEligibility = createMiddleware<
  {
    Bindings: Bindings;
    Variables: Variables;
  },
  "/",
  {
    out: {
      json: {
        recipient: string;
      };
    };
  }
>(async (c, next) => {
  if (c.env.ENV === "development") {
    await next();
    return;
  }

  const rpcEndpoint = c.env.RPC_ENDPOINT_2;
  const connection = new Connection(rpcEndpoint, "confirmed");
  const { account } = await c.req.json();

  const cacheKey = new Request(
    `https://getSignaturesForAddress.com/${account}`,
    {
      method: "GET",
    }
  );
  const cache = caches.default;
  let response = await cache.match(cacheKey);
  if (!response) {
    console.log(`Fetching signatures for ${account} from RPC`);
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(account),
      { limit: 1000 }
    );
    response = new Response(JSON.stringify(signatures));
    response.headers.append("Cache-Control", "max-age=604800"); // 1 week
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
  }
  const signatures: ConfirmedSignatureInfo[] = await response.json();

  const MINT_ELIGIBILITY_DATE_STRING = "2024-11-02T00:00:00.000Z";
  const mintEligibilityTimestamp = Math.floor(
    new Date(MINT_ELIGIBILITY_DATE_STRING).getTime() / 1000
  );

  const lastSignatureBlockTime = signatures.at(-1)?.blockTime;
  const isRecipientAllowed =
    signatures.length >= 1000 ||
    (typeof lastSignatureBlockTime === "number" &&
      lastSignatureBlockTime <= mintEligibilityTimestamp);

  if (!isRecipientAllowed) {
    throw new HTTPException(403, {
      message: `Wallet must have a valid transaction made before ${
        MINT_ELIGIBILITY_DATE_STRING.split("T")[0]
      } to mint a zkNFT`,
    });
  }

  await next();
});
