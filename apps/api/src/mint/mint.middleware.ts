import { createMiddleware } from "hono/factory";
import { Bindings } from "../common/types/bindings";
import { Variables } from "../common/types/variables";
import { PublicKey } from "@solana/web3.js";
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

  const rpc = c.get("rpc");
  const { recipient } = await c.req.json();

  const signatures = await rpc.getSignaturesForAddress(
    new PublicKey(recipient),
    { limit: 1000 }
  );

  const MINT_ELIGIBILITY_DATE_STRING = "2024-10-06T00:00:00.000Z";
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
