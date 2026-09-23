import type { DungeonMaster, DungeonMasterContext, DungeonMasterResponse } from "./domain";

export const browserDungeonMaster: DungeonMaster = {
  async respond(context: DungeonMasterContext): Promise<DungeonMasterResponse> {
    const response = await fetch("/api/dm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });

    const payload: unknown = await response.json();
    if (!response.ok) {
      const message = typeof payload === "object" && payload !== null && "error" in payload
        ? String(payload.error)
        : "The AI Dungeon Master could not respond.";
      throw new Error(message);
    }

    if (!isDungeonMasterResponse(payload)) throw new Error("The AI Dungeon Master returned an invalid response.");
    return payload;
  },
};

function isDungeonMasterResponse(value: unknown): value is DungeonMasterResponse {
  if (typeof value !== "object" || value === null || !("narration" in value)) return false;
  return typeof value.narration === "string" && value.narration.trim().length > 0;
}
