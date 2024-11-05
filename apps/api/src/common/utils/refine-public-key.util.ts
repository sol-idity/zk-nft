import { PublicKey } from "@solana/web3.js";

export const refinePublicKey = (publicKey: string) => {
  try {
    new PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
};
