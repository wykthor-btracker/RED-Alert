/** Reference item for weapons, wearables, consumables (CPRED-style). */
export interface ReferenceItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  /** Optional stats e.g. damage, range */
  [key: string]: unknown;
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
