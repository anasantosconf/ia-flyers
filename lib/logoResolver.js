import logosFolders from "@/logos-folders.json";

/**
 * Decide qual pasta de logos usar com base no tipo de flyer
 * @param {string} categoria - ex: "financas", "beneficios", "seguros", "geral"
 */
export function resolveLogoFolder(categoria) {
  if (!categoria) return getFolder("geral");

  const normalizada = categoria.toLowerCase();

  if (normalizada.includes("finan")) return getFolder("financas");
  if (normalizada.includes("benef")) return getFolder("beneficios");
  if (normalizada.includes("seguro")) return getFolder("seguros");

  return getFolder("geral");
}

function getFolder(nome) {
  return logosFolders.find(f => f.nome === nome);
}