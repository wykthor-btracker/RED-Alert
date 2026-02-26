import type { ReferenceWearable } from "@/app/types/reference";

export const referenceWearables: ReferenceWearable[] = [
  { id: "leather", name: "Leathers", category: "Light Armor", price: 50, equipmentKind: "armor", stoppingPower: 4 },
  { id: "armorjack", name: "Light Armorjack", category: "Light Armor", price: 100, equipmentKind: "armor", stoppingPower: 7 },
  { id: "heavy-armorjack", name: "Heavy Armorjack", category: "Heavy Armor", price: 500, equipmentKind: "armor", stoppingPower: 11 },
  { id: "kevlar", name: "Kevlar", category: "Medium Armor", price: 100, equipmentKind: "armor", stoppingPower: 7 },
  { id: "helm-light", name: "Capacete leve", category: "Helm", price: 50, equipmentKind: "helm", stoppingPower: 4, stoppingPowerHead: 4 },
  { id: "helm-heavy", name: "Capacete pesado", category: "Helm", price: 150, equipmentKind: "helm", stoppingPower: 7, stoppingPowerHead: 7 },
];
