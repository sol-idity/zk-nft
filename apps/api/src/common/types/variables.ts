import { Rpc } from "@lightprotocol/stateless.js";
import { DrizzleD1Database } from "drizzle-orm/d1";

export type Variables = {
  rpc: Rpc;
  db: DrizzleD1Database;
};
