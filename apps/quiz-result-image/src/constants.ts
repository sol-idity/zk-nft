import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { cleanName } from "./utils";

dotenv.config();

export const BASE_PATH = process.cwd();

export const RESULTS_DIR = path.join(BASE_PATH, "results");
export const BUILD_DIR = path.join(BASE_PATH, "public", "build");
export const ARCHETYPE_DIR = path.join(BASE_PATH, "public", "archetypes");
export const IMAGES_DIR = path.join(BUILD_DIR, "images");
export const FONT_DIR = path.join(BASE_PATH, "public", "font");

export const DB_API_KEY = {
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID!,
  CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN!,
};

export const MAX_QUESTIONS = 8;
export const BASE_URL =
  "https://files.tinys.pl/zkN5FTcJzrwp2c9G4fL3qXo9tnVhiACG3xzoP3tV3Hh";
