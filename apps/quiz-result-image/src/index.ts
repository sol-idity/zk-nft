import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generate } from "./generate";
import sharp from "sharp";
import { RESULT_IMG_FORMAT } from "./config";
import { generateTwitter } from "./generate-twitter";

const app = new Hono();

app.get("/twitter", async (c) => {
  const nftId = c.req.query("id");
  if (!nftId) {
    return c.text("No nft id provided", 400);
  }

  const nftIdNumber = Number(nftId);
  const resultImageBuffer = await generateTwitter({ nftId: nftIdNumber });

  c.res.headers.set("Content-Type", "image/png");
  return c.body(
    await sharp(resultImageBuffer)
      .resize(2400, 1200, {
        fit: "contain",
      })
      .webp({ quality: RESULT_IMG_FORMAT.quality })
      .toBuffer()
  );
});

app.get("/", async (c) => {
  const nftId = c.req.query("id");
  if (!nftId) {
    return c.text("No nft id provided", 400);
  }

  const nftIdNumber = Number(nftId);
  const resultImageBuffer = await generate({ nftId: nftIdNumber });

  c.res.headers.set("Content-Type", "image/png");
  return c.body(
    await sharp(resultImageBuffer)
      .resize(1200, 1200, {
        fit: "contain",
      })
      .webp({ quality: RESULT_IMG_FORMAT.quality })
      .toBuffer()
  );
});

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
