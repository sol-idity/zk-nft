import { Hono } from "hono";

const app = new Hono();

app.get("/actions.json", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  c.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids"
  );
  c.header(
    "Access-Control-Expose-Headers",
    "X-Action-Version, X-Blockchain-Ids"
  );
  c.header("Content-Type", "application/json");
  return c.json({
    rules: [
      {
        pathPattern: "/**",
        apiPath: "https://api.zk.tinys.pl/actions",
      },
    ],
  });
});

export default app;
