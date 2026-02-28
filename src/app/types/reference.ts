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

/** Installation location for cyberware. */
export type CyberwareInstallation = "loja" | "clinica" | "hospital" | "n/a";

/** Reference cyberware. */
export interface ReferenceCyberware {
  id: string;
  name: string;
  /** Category for grouping (Fashionware, Neuralware, etc.). */
  category: string;
  price: number;
  /** Dice for rolling humanity cost at runtime (e.g. "2d6" => 2d6 CH). When set, UI shows roll button. */
  humanityCostDice?: string;
  humanityCost?: number;
  description?: string;
  /** Where it can be installed. */
  installation?: CyberwareInstallation;
  /** Optional slot count (for foundation pieces). */
  slotOptions?: number;
  /** Reference ids this requires (e.g. Link Neural). */
  requires?: string[];
  /** Skill bonuses when worn: skill id -> bonus. */
  skillBonuses?: { skillId: string; bonus: number }[];
  /** Slug for @mention and scroll-to (defaults from id). */
  slug?: string;
  /** If true, reduces max humanity by 4 when installed (otherwise 2). Also true when category is "Borgware". */
  borgware?: boolean;
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
