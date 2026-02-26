/** Reference item for weapons, wearables, consumables (CPRED-style). */
export interface ReferenceItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  /** Optional stats e.g. damage, range */
  [key: string]: unknown;
}

/** Wearable that can be equipped as armor (body SP) or helm (head SP). */
export type WearableEquipmentKind = "armor" | "helm";

export interface ReferenceWearable extends ReferenceItem {
  /** If set, item can be equipped and contributes to stopping power. */
  equipmentKind?: WearableEquipmentKind;
  /** Default body SP when equipped (armor). */
  stoppingPower?: number;
  /** Default head SP when equipped (helm); falls back to stoppingPower if not set. */
  stoppingPowerHead?: number;
}

/** Reference cyberware. */
export interface ReferenceCyberware {
  id: string;
  name: string;
  category?: string;
  price: number;
  humanityCost?: number;
  description?: string;
}

/** Skill category for grouping in the UI. "outros" = custom skills not in reference. */
export type SkillCategoryKey =
  | "conscientizacao"
  | "corporal"
  | "controle"
  | "educacao"
  | "luta"
  | "performance"
  | "longo-alcance"
  | "social"
  | "tecnica"
  | "outros";

/** Reference skill: base stat key + description for tooltip + category for sections. */
export interface ReferenceSkill {
  id: string;
  name: string;
  baseStat: string;
  description: string;
  category: SkillCategoryKey;
}
