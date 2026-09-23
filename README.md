# AI D&D

A single-player, AI-assisted Dungeons & Dragons game foundation.

## Design goals

- Keep the world rules authoritative.
- Let the AI DM narrate and suggest outcomes without mutating state directly.
- Build a campaign engine first, then layer in multiplayer later.

## Core loop

1. Create a player character.
2. Start a scene or explore a location.
3. Submit the player's intent.
4. The AI DM returns narration and any requested dice rolls.
5. The engine records journal entries and validates state changes.

## Current foundation

- `src/domain.ts` defines the game state, player intent, and DM contract.
- `src/dice.ts` includes deterministic dice rolling and ability checks.
- `src/engine.ts` adds campaign creation, character creation, scene setup, and intent submission.
- `tests/engine.test.ts` verifies the core loop.

## Next milestones

- Add combat resolution and initiative.
- Add skill checks, spells, and inventory use.
- Add a persistent campaign store.
- Plug in a real AI provider behind the `DungeonMaster` interface.
