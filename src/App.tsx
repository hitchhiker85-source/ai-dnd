import { useMemo, useState } from "react";
import { addCharacter, addEnemy, createCampaign, createCharacter, createEnemy, setScene, submitIntent, type DungeonMaster } from "./engine";
import type { CampaignState, Character, JournalEntry } from "./domain";

const hero: Character = createCharacter({
  name: "Arin",
  ancestry: "Human",
  className: "Fighter",
  abilities: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 10, charisma: 8 },
  hitPoints: { maximum: 12 },
  armorClass: 14,
  inventory: ["Longsword", "Torch", "Rations"],
});

function initialCampaign(): CampaignState {
  const scene = { id: "gate", title: "The Shivering Gate", description: "A rusted gate guards a forgotten stairwell beneath the castle. Cold air spills through the bars.", tags: ["Dungeon", "Entrance"], dangerLevel: 1 };
  return addEnemy(
    setScene(addCharacter(createCampaign("The First Door"), hero), scene),
    createEnemy({ name: "Cave Goblin", armorClass: 12, hitPoints: 8, attackBonus: 3, damageDice: "1d6", notes: "It watches from the shadows." }),
  );
}

const scriptedDm: DungeonMaster = {
  async respond({ campaign, intent }) {
    const enemy = campaign.enemies.find((candidate) => candidate.hitPoints.current > 0);
    const action = intent.text.toLowerCase();
    if (action.includes("attack") || action.includes("strike") || action.includes("sword")) {
      return { narration: enemy ? `You charge the ${enemy.name}. The clash of steel echoes through the gate. Roll combat is ready for the next step.` : "Your weapon cuts through the empty darkness. The path is clear." };
    }
    if (action.includes("search") || action.includes("look")) return { narration: "You search the gatehouse. Beneath the dust, you find fresh tracks leading down the stairs." };
    if (action.includes("talk") || action.includes("speak")) return { narration: "Your voice carries into the dark. Something below answers with a low, uneasy growl." };
    return { narration: `The dungeon responds to your action: ${intent.text.trim()} The torchlight bends across ancient stone.` };
  },
};

function App() {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [intent, setIntent] = useState("");
  const [busy, setBusy] = useState(false);
  const character = campaign.characters[0];
  const livingEnemies = campaign.enemies.filter((enemy) => enemy.hitPoints.current > 0);
  const lastNarration = useMemo(() => [...campaign.journal].reverse().find((item) => item.kind === "narration"), [campaign.journal]);

  async function act(event: React.FormEvent) {
    event.preventDefault();
    if (!character || !intent.trim() || busy) return;
    setBusy(true);
    try {
      setCampaign(await submitIntent(campaign, { characterId: character.id, text: intent, type: "other" }, scriptedDm));
      setIntent("");
    } finally { setBusy(false); }
  }

  function reset() { setCampaign(initialCampaign()); setIntent(""); }

  return (
    <main className="app-shell">
      <header className="topbar"><div><p className="eyebrow">SOLO ADVENTURE</p><h1>AI <span>D&amp;D</span></h1></div><button className="secondary" onClick={reset}>New adventure</button></header>
      <section className="hero-card"><div><p className="eyebrow">CAMPAIGN · ROUND {campaign.round}</p><h2>{campaign.title}</h2><p>{campaign.scene?.description}</p><div className="tags">{campaign.scene?.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="scene-mark">✦</div></section>
      <div className="game-grid">
        <section className="panel journal-panel"><div className="panel-heading"><h3>Adventure log</h3><span>{campaign.journal.length} entries</span></div><div className="narration">{lastNarration?.text ?? "The gate waits. What will you do?"}</div><div className="log-list">{campaign.journal.slice().reverse().map((item: JournalEntry) => <div className={`log-entry ${item.kind}`} key={item.id}><span>{item.kind === "narration" ? "DM" : item.kind === "player-action" ? "YOU" : "SYS"}</span><p>{item.text}</p></div>)}</div><form onSubmit={act} className="action-form"><input value={intent} onChange={(event) => setIntent(event.target.value)} placeholder="What do you do? Try: search the gate, talk, attack..." disabled={busy} /><button disabled={busy || !intent.trim()}>{busy ? "Thinking…" : "Take action"}</button></form></section>
        <aside className="sidebar"><section className="panel"><div className="panel-heading"><h3>Hero</h3><span>Level {character?.level}</span></div><h2 className="character-name">{character?.name}</h2><p className="muted">{character?.ancestry} · {character?.className}</p><div className="stat"><div><span>Hit points</span><strong>{character?.hitPoints.current} / {character?.hitPoints.maximum}</strong></div><div className="bar"><i style={{ width: `${((character?.hitPoints.current ?? 0) / (character?.hitPoints.maximum ?? 1)) * 100}%` }} /></div></div><div className="mini-grid"><div><span>AC</span><strong>{character?.armorClass}</strong></div><div><span>STR</span><strong>{character?.abilities.strength}</strong></div><div><span>DEX</span><strong>{character?.abilities.dexterity}</strong></div></div><h4>Inventory</h4><ul className="inventory">{character?.inventory.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel encounter"><div className="panel-heading"><h3>Encounter</h3><span>{livingEnemies.length ? "Danger" : "Clear"}</span></div>{campaign.enemies.map((enemy) => <div className="enemy" key={enemy.id}><div><strong>{enemy.name}</strong><p>{enemy.notes}</p></div><span>{enemy.hitPoints.current}/{enemy.hitPoints.maximum} HP</span></div>)}</section></aside>
      </div>
      <footer><span>Rules engine online</span><span>AI DM: scripted preview</span></footer>
    </main>
  );
}

export { App };
