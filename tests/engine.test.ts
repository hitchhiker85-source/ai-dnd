import { describe, expect, it } from "vitest";
import { abilityCheck, roll } from "../src/dice.js";
import { addCharacter, createCampaign, createCharacter, setScene, submitIntent } from "../src/engine.js";
import type { Character } from "../src/domain.js";

const hero: Character = {
  id: "hero-1",
  name: "Arin",
  ancestry: "Human",
  className: "Fighter",
  level: 1,
  abilities: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 10, charisma: 8 },
  hitPoints: { current: 12, maximum: 12 },
  armorClass: 14,
  inventory: ["Longsword"],
};

describe("dice", () => {
  it("rolls with a supplied random source", () => {
    const result = roll("2d6+3", { nextInt: () => 0 });
    expect(result.rolls).toEqual([1, 1]);
    expect(result.total).toBe(5);
  });

  it("supports ability checks", () => {
    const result = abilityCheck("dexterity", 14, 12, { nextInt: () => 4 });
    expect(result.modifier).toBe(2);
    expect(result.total).toBe(7);
    expect(result.success).toBe(false);
  });
});

describe("campaign engine", () => {
  it("creates a character and a scene", () => {
    const character = createCharacter({
      name: "Elira",
      ancestry: "Elf",
      className: "Rogue",
      abilities: { strength: 8, dexterity: 16, constitution: 12, intelligence: 14, wisdom: 10, charisma: 13 },
      armorClass: 13,
      inventory: ["Dagger"],
    });

    const campaign = setScene(addCharacter(createCampaign("The First Door"), character), {
      id: "scene-1",
      title: "The Shivering Gate",
      description: "A rusted gate guards a forgotten stairwell beneath the castle.",
      tags: ["Dungeon", "Entrance"],
      dangerLevel: 1,
    });

    expect(campaign.scene?.title).toBe("The Shivering Gate");
    expect(campaign.characters[0]?.name).toBe("Elira");
  });

  it("records a player action and DM narration", async () => {
    const campaign = addCharacter(createCampaign("The First Door"), hero);
    const updated = await submitIntent(campaign, { characterId: hero.id, text: "Open the door" }, {
      respond: async () => ({ narration: "Beyond the door, torchlight flickers." }),
    });
    expect(updated.journal.map((item) => item.kind)).toEqual(["system", "player-action", "narration"]);
  });
});
