export type Id = string;

export type Ability = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export interface Character {
  id: Id;
  name: string;
  ancestry: string;
  className: string;
  level: number;
  abilities: Record<Ability, number>;
  hitPoints: { current: number; maximum: number };
  inventory: string[];
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
  round: number;
  activeCharacterId: Id | null;
}

export interface PlayerIntent {
  characterId: Id;
  text: string;
}

export interface DiceRoll {
  notation: string;
  rolls: number[];
  modifier: number;
  total: number;
}

export interface DungeonMasterContext {
  campaign: CampaignState;
  intent: PlayerIntent;
}

export interface DungeonMasterResponse {
  narration: string;
  requestedRoll?: { notation: string; reason: string };
}
