export const ARCHETYPE_TOTAL_IMAGES = 800; // NFT image count generated per archetype

export const RESULT_IMG_FORMAT = {
  width: 2778,
  height: 2778,
  smoothing: false,
  quality: 30,
} as const;

/**
 * archetype image file names
 * the order should be same as the archetype order
 */
export const ARCHETYPE_IMAGES = [
  "almond.png",
  "cashew.png",
  "chestnut.png",
  "hazelnut.png",
  "macademia.png",
  "pecan.png",
  "pistachio.png",
  "walnut.png",
];

export const DRAW_CONFIG = {
  nftSize: 380, // NFT image size
  padding: 60, // White rect padding
  rectCornerRadius: 30, // White rect corder radius
  nftCornerRadius: 20, // Nft radius
  rectY: 240, // White rect position Y
  percentageTextPt: 375, // Gap size between rect and percentage text
  letterSpacing: 6,
};
