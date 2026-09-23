import { describe, expect, it } from "vitest";
import { roll } from "../src/dice.js";
import { addCharacter, createCampaign, submitIntent } from "../src/engine.js";
import type { Character } from "../src/domain.js";

const hero: Character = {
  id: "hero-1", name: "Arin", ancestry: "Human", className: "Fighter", level: 1,
  abilities: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 10, charisma: 8 },
  hitPoints: { current: 12, maximum: 12 }, inventory: ["Longsword"],
};

describe("dice", () => {
  it("rolls with a supplied random source", () => {
    const result = roll("2d6+3", { nextInt: () => 0 });
    expect(result.rolls).toEqual([1, 1]);
    expect(result.total).toBe(5);
  });
});

describe("campaign engine", () => {
  it("records a player action and DM narration", async () => {
    const campaign = addCharacter(createCampaign("The First Door"), hero);
    const updated = await submitIntent(campaign, { characterId: hero.id, text: "Open the door" }, {
      respond: async () => ({ narration: "Beyond the door, torchlight flickers." }),
    });
    expect(updated.journal.map((item) => item.kind)).toEqual(["player-action", "narration"]);
  });
});
