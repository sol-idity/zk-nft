export type Bindings = {
  DB: D1Database;
  RPC_ENDPOINT: string;
  RPC_ENDPOINT_2: string;
  UPDATE_AUTHORITY_KEYPAIR: string;
  ENV: "development" | "production";
  MINT_RATE_LIMITER: RateLimit;
  STAKE_RATE_LIMITER: RateLimit;
};
