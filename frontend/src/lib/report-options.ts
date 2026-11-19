export const SEX_OPTIONS = ["macho", "hembra"] as const;
export const SIZE_OPTIONS = ["pequeño", "mediano", "grande"] as const;

const SPECIES_PREFIX = "Especie:";


export function buildCharacteristics(species: string, signs: string): string {
  const base = `${SPECIES_PREFIX} ${species.trim()}`;
  const extra = signs.trim();
  return extra ? `${base}; ${extra}` : base;
}

export function parseCharacteristics(value: string | null): {
  species: string | null;
  signs: string;
} {
  if (!value) return { species: null, signs: "" };

  const match = value.match(/^Especie:\s*([^;]*?)\s*(?:;\s*([\s\S]*))?$/);
  if (!match) return { species: null, signs: value };

  return { species: match[1] || null, signs: (match[2] ?? "").trim() };
}

export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}