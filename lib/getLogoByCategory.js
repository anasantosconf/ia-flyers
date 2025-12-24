import logos from "@/data/logos-folders.json";

export function getLogoByCategory(categoria) {
  if (!categoria) return null;

  const normalizada = categoria.toLowerCase();

  return logos.find(
    (l) => l.nome.toLowerCase() === normalizada
  ) || null;
}