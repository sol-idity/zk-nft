import {
  ARCHETYPE_DIR,
  BASE_PATH,
  BASE_URL,
  FONT_DIR,
  RESULTS_DIR,
} from "./constants";
import path from "path";
import {
  getArchetypeFromId,
  loadImg,
  loadImgFromPath,
  nftIdToResult,
  queryDB,
} from "./utils";
import { createCanvas, registerFont } from "canvas";
import { ARCHETYPE_IMAGES, DRAW_CONFIG, RESULT_IMG_FORMAT } from "./config";

export const generateTwitter = async ({ nftId }: { nftId: number }) => {
  const result = nftIdToResult(nftId);

  registerFont(path.resolve(`${FONT_DIR}/Tiny5-Regular.ttf`), {
    family: "Tiny5",
  });

  const RESULT_WIDTH = 3012;
  const RESULT_HEIGHT = 1709;
  const canvas = createCanvas(RESULT_WIDTH, RESULT_HEIGHT);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = RESULT_IMG_FORMAT.smoothing;

  const nftSize = 900;
  const padding = 60;
  const nftCornerRadius = 60;
  const rectY = 116;
  const rectX = 203;

  const archetype = getArchetypeFromId(nftId);

  const archetypeImgPath = `${path.join(BASE_PATH, "public", "twitter-archetypes")}/${ARCHETYPE_IMAGES[archetype]}`;
  const archetypeImg = await loadImgFromPath(archetypeImgPath);
  const nftImg = await loadImg(`${BASE_URL}/${nftId}.png`);

  // Draw archetype img
  ctx.drawImage(archetypeImg, 0, 0, RESULT_WIDTH, RESULT_HEIGHT);

  // Start clipping for rounded NFT image
  const nftX = rectX + padding / 2;
  const nftY = rectY + padding / 2;
  const nftWidth = nftSize;
  const nftHeight = nftSize;

  // Save the canvas state before clipping
  ctx.save();

  // Create rounded rectangle path for clipping
  ctx.beginPath();
  ctx.moveTo(nftX + nftCornerRadius, nftY);
  ctx.lineTo(nftX + nftWidth - nftCornerRadius, nftY);
  ctx.quadraticCurveTo(
    nftX + nftWidth,
    nftY,
    nftX + nftWidth,
    nftY + nftCornerRadius
  );
  ctx.lineTo(nftX + nftWidth, nftY + nftHeight - nftCornerRadius);
  ctx.quadraticCurveTo(
    nftX + nftWidth,
    nftY + nftHeight,
    nftX + nftWidth - nftCornerRadius,
    nftY + nftHeight
  );
  ctx.lineTo(nftX + nftCornerRadius, nftY + nftHeight);
  ctx.quadraticCurveTo(
    nftX,
    nftY + nftHeight,
    nftX,
    nftY + nftHeight - nftCornerRadius
  );
  ctx.lineTo(nftX, nftY + nftCornerRadius);
  ctx.quadraticCurveTo(nftX, nftY, nftX + nftCornerRadius, nftY);
  ctx.closePath();
  ctx.clip();

  // Draw the clipped NFT image
  ctx.drawImage(nftImg, nftX, nftY, nftWidth, nftHeight);

  // Reset the clipping path for the next iteration
  ctx.restore();

  const canvasBuffer = canvas.toBuffer("image/png");
  return canvasBuffer;
};
