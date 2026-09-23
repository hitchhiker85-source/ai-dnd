# AI D&D

A single-player, AI-assisted Dungeons & Dragons game foundation.

## Direction

The first milestone is a reliable local game engine with an AI Dungeon Master interface. Multiplayer will be added later around the same campaign/session model rather than embedded into the game rules.

## Architecture

- `src/domain.ts` contains the serializable game state and domain types.
- `src/dice.ts` contains deterministic-friendly dice utilities.
- `src/engine.ts` contains validated state transitions and the Dungeon Master port.
- AI providers should implement `DungeonMaster` and propose narration/actions; they do not mutate state directly.

The engine remains authoritative for character changes, dice rolls, turns, and campaign history. This keeps AI output creative without allowing it to bypass game rules.

## Getting started

```bash
npm install
npm test
npm run build
```

The project intentionally has no provider-specific AI dependency yet. Add one behind the `DungeonMaster` interface after the core loop is established.
