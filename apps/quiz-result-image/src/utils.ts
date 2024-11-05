import { ARCHETYPE_TOTAL_IMAGES } from "./config";
import { loadImage } from "canvas";
import { DB_API_KEY } from "./constants";
import axios from "axios";

export const cleanName = (name: string) => {
  const lastDotIndex = name.lastIndexOf(".");

  if (lastDotIndex === -1) return name;
  return name.slice(0, lastDotIndex);
};

export const getArchetypeFromId = (id: number): number => {
  return Math.floor(id / ARCHETYPE_TOTAL_IMAGES);
};

export const loadImgFromPath = async (imgPath: string) => {
  try {
    const image = await loadImage(imgPath);
    return image;
  } catch (error) {
    console.error("⚠️ ERROR: Loading image", error);
    throw new Error("Error loading image");
  }
};

export const loadImg = async (imgUri: string) => {
  try {
    const imageBuffer = await axios.get(imgUri, { responseType: "arraybuffer" });
    const image = await loadImage(imageBuffer.data);
    return image;
  } catch (error) {
    console.error("⚠️ ERROR: Loading image", error);
    throw new Error("Error loading image");
  }
};

export const queryDB = (query: string) => {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN } =
    DB_API_KEY;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLOUDFLARE_D1_TOKEN}`,
    },
    body: JSON.stringify({ sql: query }),
  };

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_DATABASE_ID}/query`;

  return fetch(url, options)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("⚠️ ERROR: DB", error);
      throw new Error("Error querying DB");
    });
};

export const nftIdToResult = (nftId: number) => {
  if (nftId >= 0 && nftId <= 799) {
    return 0;
  } else if (nftId >= 800 && nftId <= 1599) {
    return 1;
  } else if (nftId >= 1600 && nftId <= 2399) {
    return 2;
  } else if (nftId >= 2400 && nftId <= 3199) {
    return 3;
  } else if (nftId >= 3200 && nftId <= 3999) {
    return 4;
  } else if (nftId >= 4000 && nftId <= 4799) {
    return 5;
  } else if (nftId >= 4800 && nftId <= 5599) {
    return 6;
  } else if (nftId >= 5600 && nftId <= 6399) {
    return 7;
  }

  throw new Error("Invalid NFT ID");
};
