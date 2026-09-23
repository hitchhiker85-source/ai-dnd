import type { Ability, AbilityCheckResult, AttackResult, DiceRoll, Enemy, RandomSource } from "./domain";

export interface RandomSource { nextInt(maxExclusive: number): number; }
export const systemRandom: RandomSource = { nextInt: (maxExclusive) => Math.floor(Math.random() * maxExclusive) };
export function abilityModifier(score: number): number { return Math.floor((score - 10) / 2); }
export function roll(notation: string, random: RandomSource = systemRandom): DiceRoll {
  const match = /^(\d*)d(\d+)([+-]\d+)?$/i.exec(notation.trim());
  if (!match) throw new Error(`Invalid dice notation: ${notation}`);
  const count = Number(match[1] || 1), sides = Number(match[2]), modifier = Number(match[3] || 0);
  if (count < 1 || count > 100 || sides < 2) throw new Error("Dice values are out of range");
  const rolls = Array.from({ length: count }, () => random.nextInt(sides) + 1);
  return { notation, rolls, modifier, total: rolls.reduce((sum, value) => sum + value, modifier) };
}
export function abilityCheck(ability: Ability, score: number, dc: number, random: RandomSource = systemRandom): AbilityCheckResult {
  const rollResult = roll("1d20", random), modifier = abilityModifier(score), total = rollResult.total + modifier;
  return { ability, modifier, roll: rollResult, total, dc, success: total >= dc };
}
export function createEnemy(input: { name: string; armorClass: number; hitPoints: number; attackBonus: number; damageDice: string; notes?: string }): Enemy {
  return { id: `enemy-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, name: input.name, armorClass: input.armorClass, hitPoints: { current: input.hitPoints, maximum: input.hitPoints }, attackBonus: input.attackBonus, damageDice: input.damageDice, ...(input.notes ? { notes: input.notes } : {}) };
}
export function applyDamage<T extends { hitPoints: { current: number; maximum: number } }>(target: T, amount: number): T {
  return { ...target, hitPoints: { ...target.hitPoints, current: Math.max(0, target.hitPoints.current - Math.max(0, amount)) } };
}
export function resolveAttack(attacker: { name: string; attackBonus: number; damageDice: string }, defender: { name: string; armorClass: number; hitPoints: { current: number; maximum: number } }, random: RandomSource = systemRandom): AttackResult {
  const attackRoll = roll("1d20", random), total = attackRoll.total + attacker.attackBonus, hit = total >= defender.armorClass, damage = hit ? roll(attacker.damageDice, random).total : 0;
  return { attacker: { name: attacker.name, attackBonus: attacker.attackBonus }, defender: { name: defender.name, armorClass: defender.armorClass }, attackRoll, total, hit, damage, remainingHp: Math.max(0, defender.hitPoints.current - damage) };
}
