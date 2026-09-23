import { randomUUID } from "node:crypto";
import type { CampaignState, Character, Enemy, JournalEntry, PlayerIntent, Scene } from "./domain.js";
import { applyDamage, abilityCheck, createEnemy, resolveAttack, roll } from "./dice.js";

export { applyDamage, abilityCheck, createEnemy, resolveAttack, roll } from "./dice.js";
export * from "./domain.js";

export interface DungeonMaster {
  respond(context: { campaign: CampaignState; intent: PlayerIntent }): Promise<{ narration: string; requestedRoll?: { notation: string; reason: string } }>;
}

const entry = (kind: JournalEntry["kind"], text: string): JournalEntry => ({
  id: randomUUID(),
  kind,
  text,
  createdAt: new Date().toISOString(),
});

export function createCampaign(title: string): CampaignState {
  if (!title.trim()) throw new Error("A campaign title is required");
  return {
    id: randomUUID(),
    title: title.trim(),
    characters: [],
    journal: [],
    scene: null,
    round: 1,
    activeCharacterId: null,
    worldFacts: [],
    enemies: [],
  };
}

export function createCharacter(input: {
  name: string;
  ancestry: string;
  className: string;
  level?: number;
  abilities: Character["abilities"];
  hitPoints?: Partial<Character["hitPoints"]>;
  inventory?: string[];
  armorClass?: number;
}): Character {
  if (!input.name.trim()) throw new Error("Character name is required");

  const maximum = input.hitPoints?.maximum ?? 10;
  const current = input.hitPoints?.current ?? maximum;

  return {
    id: randomUUID(),
    name: input.name.trim(),
    ancestry: input.ancestry.trim(),
    className: input.className.trim(),
    level: input.level ?? 1,
    abilities: input.abilities,
    hitPoints: { current, maximum },
    armorClass: input.armorClass ?? 10,
    inventory: input.inventory ?? [],
  };
}

export function addCharacter(campaign: CampaignState, character: Character): CampaignState {
  if (campaign.characters.some((existing) => existing.id === character.id)) throw new Error("Character already belongs to this campaign");
  return {
    ...campaign,
    characters: [...campaign.characters, character],
    activeCharacterId: campaign.activeCharacterId ?? character.id,
    journal: [...campaign.journal, entry("system", `${character.name} joins the party.`)],
  };
}

export function addEnemy(campaign: CampaignState, enemy: Enemy): CampaignState {
  if (campaign.enemies.some((existing) => existing.id === enemy.id)) throw new Error("Enemy already in encounter");
  return {
    ...campaign,
    enemies: [...campaign.enemies, enemy],
    journal: [...campaign.journal, entry("system", `${enemy.name} enters the encounter.`)],
  };
}

export function setScene(campaign: CampaignState, scene: Scene): CampaignState {
  return {
    ...campaign,
    scene,
    journal: [...campaign.journal, entry("system", `Scene changed: ${scene.title}`)],
  };
}

export function addWorldFact(campaign: CampaignState, fact: string): CampaignState {
  const trimmed = fact.trim();
  if (!trimmed) throw new Error("World facts cannot be empty");
  if (campaign.worldFacts.includes(trimmed)) return campaign;
  return { ...campaign, worldFacts: [...campaign.worldFacts, trimmed] };
}

export function advanceRound(campaign: CampaignState): CampaignState {
  return {
    ...campaign,
    round: campaign.round + 1,
    journal: [...campaign.journal, entry("system", `Round ${campaign.round + 1} begins.`)],
  };
}

export async function submitIntent(campaign: CampaignState, intent: PlayerIntent, dm: DungeonMaster): Promise<CampaignState> {
  const character = campaign.characters.find((candidate) => candidate.id === intent.characterId);
  if (!character) throw new Error("The acting character is not in this campaign");
  if (!intent.text.trim()) throw new Error("An action is required");

  const withIntent = {
    ...campaign,
    journal: [...campaign.journal, entry("player-action", `${character.name}: ${intent.text.trim()}`)],
  };
  const response = await dm.respond({ campaign: withIntent, intent });
  if (!response.narration.trim()) throw new Error("The Dungeon Master returned empty narration");

  return {
    ...withIntent,
    journal: [...withIntent.journal, entry("narration", response.narration.trim())],
  };
}

export const scriptedDungeonMaster: DungeonMaster = {
  async respond({ intent }) {
    return { narration: `The world responds to your attempt: ${intent.text.trim()}` };
  },
};
