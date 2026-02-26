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
}

/** Installed cyberware. */
export interface CyberwareEntry {
  name: string;
  referenceId?: string;
  notes?: string;
  humanityCost?: number;
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
