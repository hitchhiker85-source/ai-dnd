export type Id = string;

export type Ability = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: Id;
  name: string;
  ancestry: string;
  className: string;
  level: number;
  abilities: Record<Ability, number>;
  hitPoints: { current: number; maximum: number };
  armorClass: number;
  inventory: string[];
}

export interface Enemy {
  id: Id;
  name: string;
  armorClass: number;
  hitPoints: { current: number; maximum: number };
  attackBonus: number;
  damageDice: string;
  notes?: string;
}

export interface Scene {
  id: Id;
  title: string;
  description: string;
  tags: string[];
  dangerLevel: number;
}

export interface JournalEntry {
  id: Id;
  kind: "narration" | "player-action" | "system";
  text: string;
  createdAt: string;
}

export interface CampaignState {
  id: Id;
  title: string;
  characters: Character[];
  journal: JournalEntry[];
  scene: Scene | null;
  round: number;
  activeCharacterId: Id | null;
  worldFacts: string[];
  enemies: Enemy[];
}

export interface PlayerIntent {
  characterId: Id;
  text: string;
  type?: "explore" | "combat" | "social" | "skill" | "other";
}

export interface DiceRoll {
  notation: string;
  rolls: number[];
  modifier: number;
  total: number;
}

export interface AbilityCheckResult {
  ability: Ability;
  modifier: number;
  roll: DiceRoll;
  total: number;
  dc: number;
  success: boolean;
}

export interface AttackResult {
  attacker: { name: string; attackBonus: number };
  defender: { name: string; armorClass: number };
  attackRoll: DiceRoll;
  total: number;
  hit: boolean;
  damage: number;
  remainingHp: number;
}

export interface DungeonMasterContext {
  campaign: CampaignState;
  intent: PlayerIntent;
}

export interface DungeonMasterResponse {
  narration: string;
  requestedRoll?: { notation: string; reason: string };
}
