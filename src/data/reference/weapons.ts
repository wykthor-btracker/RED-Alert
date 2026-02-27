import type { ReferenceItem } from "@/app/types/reference";
import type { WeaponTypeKey } from "@/data/weaponRangeTables";

export interface ReferenceWeapon extends ReferenceItem {
  /** Key for range table (BASE_SHOT_DV) or "melee". */
  weaponType?: WeaponTypeKey;
  /** Damage dice string e.g. "2d6", "5d6". */
  damageDice?: string;
  /** Skill used e.g. "Armas de uma Mão". */
  skill?: string;
  /** Has autofire (uses AUTOFIRE_DV table). */
  autofire?: boolean;
}

export const referenceWeapons: ReferenceWeapon[] = [
  { id: "vhp", name: "Pistola Muito Pesada", category: "Pistol", price: 100, weaponType: "pistola", damageDice: "4d6", skill: "Armas de uma Mão" },
  { id: "hp", name: "Pistola Pesada", category: "Pistol", price: 100, weaponType: "pistola", damageDice: "3d6", skill: "Armas de uma Mão" },
  { id: "mp", name: "Pistola Média", category: "Pistol", price: 50, weaponType: "pistola", damageDice: "2d6", skill: "Armas de uma Mão" },
  { id: "smg", name: "SMG", category: "SMG", price: 100, weaponType: "smg", damageDice: "2d6", skill: "Armas de uma Mão", autofire: true },
  { id: "smg_heavy", name: "SMG Pesada", category: "SMG", price: 100, weaponType: "smg", damageDice: "3d6", skill: "Armas de uma Mão", autofire: true },
  { id: "shotgun", name: "Espingarda", category: "Shotgun", price: 500, weaponType: "espingarda", damageDice: "5d6", skill: "Armas de Ombro" },
  { id: "ar", name: "Rifle de Assalto", category: "Rifle", price: 500, weaponType: "rifle_assalto", damageDice: "5d6", skill: "Armas de Ombro", autofire: true },
  { id: "sniper", name: "Rifle Sniper", category: "Rifle", price: 500, weaponType: "rifle_sniper", damageDice: "5d6", skill: "Armas de Ombro" },
  { id: "arco", name: "Arco & Besta", category: "Arquearia", price: 100, weaponType: "arco_besta", damageDice: "4d6", skill: "Arquearia" },
  { id: "grenade", name: "Lançador de Granadas", category: "Heavy", price: 500, weaponType: "lancador_granadas", damageDice: "6d6", skill: "Arma Pesada" },
  { id: "rocket", name: "Lança Mísseis", category: "Heavy", price: 500, weaponType: "lanca_misseis", damageDice: "8d6", skill: "Arma Pesada" },
  { id: "knife", name: "Faca", category: "Melee", price: 50, weaponType: "melee", damageDice: "1d6", skill: "Luta" },
  { id: "club", name: "Bastão", category: "Melee", price: 20, weaponType: "melee", damageDice: "2d6", skill: "Luta" },
];
