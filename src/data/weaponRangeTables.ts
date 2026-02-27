/**
 * CPRED-style range tables: DVs for ranged shots and autofire by distance.
 * Distances in m/yds; N/A = weapon not effective at that range.
 */

export const RANGE_BANDS = [
  "0 a 6",
  "7 a 12",
  "13 a 25",
  "26 a 50",
  "51 a 100",
  "101 a 200",
  "201 a 400",
  "401 a 800",
] as const;

/** Keys used in reference weapons to look up range table row. */
export type RangedWeaponTypeKey =
  | "pistola"
  | "smg"
  | "espingarda"
  | "rifle_assalto"
  | "rifle_sniper"
  | "arco_besta"
  | "lancador_granadas"
  | "lanca_misseis";

export type MeleeWeaponTypeKey = "melee";

export type WeaponTypeKey = RangedWeaponTypeKey | MeleeWeaponTypeKey;

/** Base shot DV by weapon type and range band (index = RANGE_BANDS index). null = N/A. */
export const BASE_SHOT_DV: Record<RangedWeaponTypeKey, (number | null)[]> = {
  pistola: [13, 15, 20, 25, 30, 30, null, null],
  smg: [15, 13, 15, 20, 25, 25, 30, null],
  espingarda: [13, 15, 20, 25, 30, 35, null, null],
  rifle_assalto: [17, 16, 15, 13, 15, 20, 25, 30],
  rifle_sniper: [30, 25, 25, 20, 15, 16, 17, 20],
  arco_besta: [15, 13, 15, 17, 20, 22, null, null],
  lancador_granadas: [16, 15, 15, 17, 20, 22, 25, null],
  lanca_misseis: [17, 16, 15, 15, 20, 20, 25, 30],
};

/** Autofire DV: only 5 range bands (0-6, 7-12, 13-25, 26-50, 51-100). */
const AUTOFIRE_RANGE_BANDS = ["0 a 6", "7 a 12", "13 a 25", "26 a 50", "51 a 100"] as const;

export const AUTOFIRE_DV: Record<string, (number | null)[]> = {
  smg: [20, 17, 20, 25, 30],
  rifle_assalto: [22, 20, 17, 20, 25],
};

export function getAutofireRangeBands(): readonly string[] {
  return AUTOFIRE_RANGE_BANDS;
}

/** Human-readable label for weapon type (for table header). */
export const WEAPON_TYPE_LABELS: Record<WeaponTypeKey, string> = {
  pistola: "Pistola",
  smg: "SMG",
  espingarda: "Espingarda (Balotes)",
  rifle_assalto: "Rifle de Assalto",
  rifle_sniper: "Rifle Sniper",
  arco_besta: "Arcos & Bestas",
  lancador_granadas: "Lançador de granadas",
  lanca_misseis: "Lança Mísseis",
  melee: "Corpo a corpo",
};
