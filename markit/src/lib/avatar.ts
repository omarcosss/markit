// DiceBear "Thumbs" avatars themed to match Markit's teal/stone palette.
// https://www.dicebear.com/styles/thumbs/

const BACKGROUND_COLORS = ["14b8a6", "0d9488", "5eead4", "2dd4bf", "0f766e"];
const SHAPE_COLORS = ["f5f5f4", "ffffff", "e7e5e4", "fafaf9"];

export function getAvatarUrl(seed: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor: BACKGROUND_COLORS.join(","),
    shapeColor: SHAPE_COLORS.join(","),
    radius: "50",
  });
  return `https://api.dicebear.com/9.x/thumbs/svg?${params.toString()}`;
}
