import type { Ability, AbilityCheckResult, DiceRoll, RandomSource } from "./domain.js";

export interface RandomSource {
  nextInt(maxExclusive: number): number;
}

export const systemRandom: RandomSource = {
  nextInt: (maxExclusive) => Math.floor(Math.random() * maxExclusive),
};

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function roll(notation: string, random: RandomSource = systemRandom): DiceRoll {
  const match = /^(\d*)d(\d+)([+-]\d+)?$/i.exec(notation.trim());
  if (!match) throw new Error(`Invalid dice notation: ${notation}`);

  const count = Number(match[1] || 1);
  const sides = Number(match[2]);
  const modifier = Number(match[3] || 0);
  if (count < 1 || count > 100 || sides < 2) throw new Error("Dice values are out of range");

  const rolls = Array.from({ length: count }, () => random.nextInt(sides) + 1);
  return { notation, rolls, modifier, total: rolls.reduce((sum, value) => sum + value, modifier) };
}

export function abilityCheck(
  ability: Ability,
  score: number,
  dc: number,
  random: RandomSource = systemRandom,
): AbilityCheckResult {
  const rollResult = roll("1d20", random);
  const modifier = abilityModifier(score);
  const total = rollResult.total + modifier;

  return {
    ability,
    modifier,
    roll: rollResult,
    total,
    dc,
    success: total >= dc,
  };
}
