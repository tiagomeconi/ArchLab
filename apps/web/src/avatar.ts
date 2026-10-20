/** Foto de perfil: lê a imagem, recorta o centro em quadrado, reduz e reexporta (tira metadados como GPS/EXIF). */
export const AVATAR_PX = 256;
export const AVATAR_MAX_INPUT = 8 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Quadrado central de uma imagem `w`×`h`. */
export function cropRect(w: number, h: number) { const s = Math.min(w, h); return { sx: Math.round((w - s) / 2), sy: Math.round((h - s) / 2), s }; }

export type AvatarError = "tipo" | "tamanho" | "ilegivel";
export async function prepareAvatar(file: File): Promise<Blob> {
  if (!AVATAR_TYPES.includes(file.type)) throw new Error("tipo" satisfies AvatarError);
  if (file.size > AVATAR_MAX_INPUT) throw new Error("tamanho" satisfies AvatarError);
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file); } catch { throw new Error("ilegivel" satisfies AvatarError); }
  const { sx, sy, s } = cropRect(bmp.width, bmp.height);
  const out = Math.min(AVATAR_PX, s);
  const c = document.createElement("canvas"); c.width = out; c.height = out;
  const ctx = c.getContext("2d"); if (!ctx) throw new Error("ilegivel" satisfies AvatarError);
  ctx.imageSmoothingQuality = "high"; ctx.drawImage(bmp, sx, sy, s, s, 0, 0, out, out); bmp.close?.();
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/webp", 0.86));
  if (blob && blob.type === "image/webp") return blob;
  const jpg = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/jpeg", 0.88));
  if (!jpg) throw new Error("ilegivel" satisfies AvatarError);
  return jpg;
}
