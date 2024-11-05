import { getAppHono } from "./common/utils/get-app-hono.util";
import { cors } from "hono/cors";
import { createRpc } from "@lightprotocol/stateless.js";
import stake from "./stake/stake.handler";
import unstake from "./unstake/unstake.handler";
import mint from "./mint/mint.handler";
import actions from "./actions/actions.handler";
import { HTTPException } from "hono/http-exception";
import { StatusCode } from "hono/utils/http-status";
import { drizzle } from "drizzle-orm/d1";

const app = getAppHono();

app.use(
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Accept-Encoding"],
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
  })
);

app.use(async function setRpc(c, next) {
  const isProdRpcEndpoint = c.env.RPC_ENDPOINT.startsWith("https");
  const rpc = createRpc(
    c.env.RPC_ENDPOINT,
    isProdRpcEndpoint ? c.env.RPC_ENDPOINT : undefined,
    isProdRpcEndpoint ? c.env.RPC_ENDPOINT : undefined,
    {
      commitment: "confirmed",
    }
  );
  c.set("rpc", rpc);
  await next();
});

app.use(async function setDb(c, next) {
  const db = drizzle(c.env.DB);
  c.set("db", db);
  await next();
});

app.route("/stake", stake);
app.route("/unstake", unstake);
// app.route("/mint", mint);

const QUIZ_START = new Date("2024-10-28T15:00:00.000Z");
// if (Date.now() >= QUIZ_START.getTime()) {
app.route("/actions", actions);
// }

app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "0.0.0",
    title: "zkNFT API",
  },
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errorResponse = err.getResponse();
    return c.json({ message: err.message }, errorResponse.status as StatusCode);
  } else {
    console.error("error stack:", err.stack);
    console.error("error message:", err.message);
    return c.json({ message: err.message }, 500);
  }
});

export default app;
