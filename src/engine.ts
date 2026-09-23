import { randomUUID } from "node:crypto";
import type { CampaignState, DungeonMasterContext, DungeonMasterResponse, JournalEntry, PlayerIntent } from "./domain.js";

export interface DungeonMaster {
  respond(context: DungeonMasterContext): Promise<DungeonMasterResponse>;
}

const entry = (kind: JournalEntry["kind"], text: string): JournalEntry => ({
  id: randomUUID(),
  kind,
  text,
  createdAt: new Date().toISOString(),
});

export function createCampaign(title: string): CampaignState {
  if (!title.trim()) throw new Error("A campaign title is required");
  return { id: randomUUID(), title: title.trim(), characters: [], journal: [], round: 1, activeCharacterId: null };
}

export function addCharacter(campaign: CampaignState, character: CampaignState["characters"][number]): CampaignState {
  if (campaign.characters.some((existing) => existing.id === character.id)) throw new Error("Character already belongs to this campaign");
  return { ...campaign, characters: [...campaign.characters, character], activeCharacterId: campaign.activeCharacterId ?? character.id };
}

export async function submitIntent(campaign: CampaignState, intent: PlayerIntent, dm: DungeonMaster): Promise<CampaignState> {
  const character = campaign.characters.find((candidate) => candidate.id === intent.characterId);
  if (!character) throw new Error("The acting character is not in this campaign");
  if (!intent.text.trim()) throw new Error("An action is required");

  const withIntent = { ...campaign, journal: [...campaign.journal, entry("player-action", `${character.name}: ${intent.text.trim()}`)] };
  const response = await dm.respond({ campaign: withIntent, intent });
  if (!response.narration.trim()) throw new Error("The Dungeon Master returned empty narration");

  return { ...withIntent, journal: [...withIntent.journal, entry("narration", response.narration.trim())] };
}

export const scriptedDungeonMaster: DungeonMaster = {
  async respond({ intent }) {
    return { narration: `The world responds to your attempt: ${intent.text.trim()}` };
  },
};
