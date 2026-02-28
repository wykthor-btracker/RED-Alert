/** Stats: key-value (e.g. INT, REF, DEX, TECH, COOL, WILL, LUCK, BODY, EMP). */
export type Stats = Record<string, number>;

/** Single skill entry: skillId from reference or name for custom; value is rank. */
export interface SkillEntry {
  /** Reference skill id, or omitted for custom */
  skillId?: string;
  /** Custom skill name when skillId is not set */
  name?: string;
  value: number;
  /** Base stat key for custom skills (e.g. "REF") */
  baseStat?: string;
}

/** Skills keyed by skill id (or synthetic id for custom). */
export type Skills = Record<string, SkillEntry>;

/** Inventory slot: from reference or custom. */
export interface InventoryEntry {
  name: string;
  quantity: number;
  referenceId?: string;
  notes?: string;
  /** For wearables that are armor/helm: whether currently equipped (affects sheet SP). */
  equipped?: boolean;
  /** Manual override for body stopping power when equipped (armor). Max SP. */
  stoppingPowerBody?: number;
  /** Manual override for head stopping power when equipped (helm). Max SP. */
  stoppingPowerHead?: number;
  /** Current body SP (e.g. after damage); when unset, treated as equal to stoppingPowerBody. */
  currentSPBody?: number;
  /** Current head SP (e.g. after damage); when unset, treated as equal to stoppingPowerHead. */
  currentSPHead?: number;
  /** For custom wearables: treat as armor or helm so they appear in the right section and contribute to sheet SP. */
  equipmentKind?: "armor" | "helm";
}

/** Installed cyberware. */
export interface CyberwareEntry {
  name: string;
  referenceId?: string;
  notes?: string;
  humanityCost?: number;
  /** Whether this cyberware is worn and applies bonuses (default true when added). */
  worn?: boolean;
}

/** Custom recorded humanity loss (trauma, therapy, etc.) for the rundown. */
export interface CustomHumanityLossEntry {
  id: string;
  /** Short description (e.g. "Trauma em combate", "Terapia"). */
  description: string;
  amount: number;
  /** Affects max humanity (e.g. permanent) or current only. */
  type: "max" | "current";
}

/** Recorded humanity recovery (therapy). */
export interface HumanityRecoveryEntry {
  id: string;
  /** "recuperacao-padrao" = 2d6, "recuperacao-extrema" = 4d6, "terapia-dependencia" = addiction only. */
  type: "recuperacao-padrao" | "recuperacao-extrema" | "terapia-dependencia";
  amountRecovered: number;
}

/** Contact: linkable via slug (from name). */
export interface Contact {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  affiliation: string;
  slug: string;
}

/** Note: linkable via slug (from title). */
export interface Note {
  id: string;
  title: string;
  content: string;
  slug: string;
}

/** Full character / user data (host-held, synced to peers). */
export interface CharacterData {
  /** Display name for this sheet (e.g. character name or "Alice - Netrunner"). */
  sheetName?: string;
  /** Data URL or preset id for character portrait/icon (used in initiative and map cells). */
  characterIcon?: string;
  stats: Stats;
  skills: Skills;
  credits: number;
  /** Current HP (optional; used for host list summary). */
  currentHealth?: number;
  maxHealth?: number;
  /** Current humanity (optional; used for host list summary). */
  currentHumanity?: number;
  maxHumanity?: number;
  weapons: InventoryEntry[];
  wearables: InventoryEntry[];
  consumables: InventoryEntry[];
  cyberware: CyberwareEntry[];
  /** Custom humanity reductions for rundown (and applied to max/current when added). */
  customHumanityLoss?: CustomHumanityLossEntry[];
  /** Recorded humanity recoveries (therapy). */
  humanityRecoveries?: HumanityRecoveryEntry[];
  contacts: Contact[];
  notes: Note[];
}

export const DEFAULT_STAT_KEYS = [
  "INT", "REF", "DEX", "TECH", "COOL", "WILL", "LUCK", "BODY", "EMP", "MOVE",
] as const;

/** Default empty character data. */
export function createDefaultCharacterData(): CharacterData {
  const stats: Stats = {};
  DEFAULT_STAT_KEYS.forEach((k) => { stats[k] = 0; });
  return {
    sheetName: "",
    stats,
    skills: {},
    credits: 0,
    weapons: [],
    wearables: [],
    consumables: [],
    cyberware: [],
    contacts: [],
    notes: [],
  };
}

/** Maximum HP from rules: 10 + (5 × average of BODY and WILL, rounded up). */
export function getDerivedMaxHealth(body: number, will: number): number {
  const b = Number(body) || 0;
  const w = Number(will) || 0;
  const avg = (b + w) / 2;
  return 10 + 5 * Math.ceil(avg);
}

/** Generate URL-safe slug from name/title. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}

/** Reference wearable shape needed to compute sheet SP from equipped items. */
export interface WearableRefForSP {
  id: string;
  equipmentKind?: "armor" | "helm";
  stoppingPower?: number;
  stoppingPowerHead?: number;
}

/** Result of getSheetStoppingPower: current/max SP and names of equipped armor/helm. */
export interface SheetStoppingPowerResult {
  body: number;
  bodyMax: number;
  head: number;
  headMax: number;
  /** Name of the equipped armor (body), if any. */
  bodyArmorName?: string;
  /** Name of the equipped helm (head), if any. */
  headArmorName?: string;
}

/** Compute body and head stopping power from sheet's equipped armor/helm (current and max), and their names. */
export function getSheetStoppingPower(
  data: CharacterData,
  refWearables: WearableRefForSP[]
): SheetStoppingPowerResult {
  let body = 0;
  let bodyMax = 0;
  let head = 0;
  let headMax = 0;
  let bodyArmorName: string | undefined;
  let headArmorName: string | undefined;
  for (const w of data.wearables ?? []) {
    if (!w.equipped) continue;
    const kind = w.equipmentKind ?? refWearables.find((r) => r.id === w.referenceId)?.equipmentKind;
    if (kind === "armor") {
      const maxSp = w.stoppingPowerBody ?? refWearables.find((r) => r.id === w.referenceId)?.stoppingPower ?? 0;
      const currentSp = w.currentSPBody ?? w.stoppingPowerBody ?? maxSp;
      body += currentSp;
      bodyMax += maxSp;
      bodyArmorName = w.name;
    } else if (kind === "helm") {
      const ref = refWearables.find((r) => r.id === w.referenceId);
      const maxSp = w.stoppingPowerHead ?? ref?.stoppingPowerHead ?? ref?.stoppingPower ?? 0;
      const currentSp = w.currentSPHead ?? w.stoppingPowerHead ?? maxSp;
      head += currentSp;
      headMax += maxSp;
      headArmorName = w.name;
    }
  }
  return { body, bodyMax, head, headMax, bodyArmorName, headArmorName };
}
