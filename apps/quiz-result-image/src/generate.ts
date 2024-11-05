import { ARCHETYPE_DIR, BASE_URL, FONT_DIR, RESULTS_DIR } from "./constants";
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

export const generate = async ({ nftId }: { nftId: number }) => {
  const result = nftIdToResult(nftId);
  const percentage =
    (
      await queryDB(
        `SELECT AVG(CASE WHEN result = ${result} THEN 1.0 ELSE 0 END) AS proportion FROM answers WHERE result IS NOT NULL;`
      )
    ).result[0].results[0].proportion * 100;
  registerFont(path.resolve(`${FONT_DIR}/Tiny5-Regular.ttf`), {
    family: "Tiny5",
  });

  const canvas = createCanvas(
    RESULT_IMG_FORMAT.width,
    RESULT_IMG_FORMAT.height
  );
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = RESULT_IMG_FORMAT.smoothing;

  const {
    nftSize,
    padding,
    rectCornerRadius,
    nftCornerRadius,
    rectY,
    percentageTextPt,
    letterSpacing,
  } = DRAW_CONFIG;

  const archetype = getArchetypeFromId(nftId);

  const archetypeImgPath = `${ARCHETYPE_DIR}/${ARCHETYPE_IMAGES[archetype]}`;
  const archetypeImg = await loadImgFromPath(archetypeImgPath);
  const nftImg = await loadImg(`${BASE_URL}/${nftId}.png`);

  // Draw archetype img
  ctx.drawImage(
    archetypeImg,
    0,
    0,
    RESULT_IMG_FORMAT.width,
    RESULT_IMG_FORMAT.height
  );

  // Define dimensions for the white rectangle
  const rectWidth = nftSize + padding;
  const rectHeight = nftSize + padding;
  const rectX = (RESULT_IMG_FORMAT.width - rectWidth) / 2;

  // Draw the white rounded rectangle
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(rectX + rectCornerRadius, rectY);
  ctx.lineTo(rectX + rectWidth - rectCornerRadius, rectY);
  ctx.quadraticCurveTo(
    rectX + rectWidth,
    rectY,
    rectX + rectWidth,
    rectY + rectCornerRadius
  );
  ctx.lineTo(rectX + rectWidth, rectY + rectHeight - rectCornerRadius);
  ctx.quadraticCurveTo(
    rectX + rectWidth,
    rectY + rectHeight,
    rectX + rectWidth - rectCornerRadius,
    rectY + rectHeight
  );
  ctx.lineTo(rectX + rectCornerRadius, rectY + rectHeight);
  ctx.quadraticCurveTo(
    rectX,
    rectY + rectHeight,
    rectX,
    rectY + rectHeight - rectCornerRadius
  );
  ctx.lineTo(rectX, rectY + rectCornerRadius);
  ctx.quadraticCurveTo(rectX, rectY, rectX + rectCornerRadius, rectY);
  ctx.closePath();
  ctx.fill();

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

  const text = `${percentage.toFixed(1)}% PEOPLE ARE ALSO THIS TYPE`;

  // Set font properties
  ctx.font = "52px Tiny5";
  ctx.fillStyle = archetype === 2 || archetype === 4 ? "black" : "white";
  ctx.textAlign = "left";

  // Calculate total width including letter spacing
  let totalWidth = 0;
  for (let i = 0; i < text.length; i++) {
    totalWidth += ctx.measureText(text[i]).width;
    if (i < text.length - 1) totalWidth += letterSpacing; // Add letter spacing
  }

  // Calculate the starting X position to center the text
  const centerX = RESULT_IMG_FORMAT.width / 2;
  let startX = centerX - totalWidth / 2;

  // Calculate Y position for the text
  const textYPosition = nftY + nftHeight + percentageTextPt;

  // Draw each character with spacing
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillText(char, startX, textYPosition);
    startX += ctx.measureText(char).width + letterSpacing;
  }

  const canvasBuffer = canvas.toBuffer("image/png");
  return canvasBuffer;
};
