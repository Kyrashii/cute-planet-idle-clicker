# Domain glossary

Shared vocabulary for the game. These concepts are more stable than file paths — use them
when reading code and writing commits/PRs.

| Term | Meaning |
| --- | --- |
| **Planet** | The thing you tap. It has a **level** (1–20+); levelling unlocks content and, at level 20, Galaxy Voyage. |
| **Gehege** | German for "enclosure" — the area where you place hatched animals. They gain **love** over time (boostable by feeding), which grants auras and an LPS bonus. |
| **Animal** | A buyable creature (bunny, chick, cat, frog, koala, panda, unicorn, …). Each produces life per second (LPS); cost scales per purchase. |
| **Life** | The primary currency, earned by tapping and passively via LPS. |
| **LPS** | Life Per Second — the passive income rate computed by `statsCalculator`. |
| **Stars** | Buyable bodies that add passive LPS and can be clicked for crit/trigger events. |
| **Moons** | Rarer than stars, mergeable, with a cap that scales with prestige. |
| **Prestige** | Reset run progress for a permanent LPS multiplier. |
| **Glitch Galaxy** | Post-level-20 content tier with its own shop/shards. |
| **Roguelite / Galaxy Voyage** | The run-based mode unlocked at level 20 — see `docs/roguelite.md`. |
| **Zodiac / Constellation** | A chosen specialisation that grants a unique bonus (e.g. cat = crit, owl = star power, fox = click power, frog = faster missions). |
| **Cosmetics** | Visual unlocks (star colours, accessories, frames, moon/planet skins), rolled from shooting stars / crafted, upgradeable in rarity, with set bonuses. |
| **Crafting** | Combine currencies/items via recipes to open lootboxes and craft cosmetics. |
| **Missions** | Rotating short-term goals that reward shooting stars. |
| **Cosmic events** | Random timed events where the player picks one of several outcomes. |
| **Planet task** | A per-level objective tracked toward levelling the planet. |
| **Glitter dust** | A secondary currency gating some upgrades/cosmetics. |

## Bilingual content convention

The game ships English and German content side by side. Content types (`Animal`,
`Upgrade`, `StarUpgrade`, …) carry German fields next to their English ones — e.g.
`name` / `germanName`, `description` / `germanDescription`,
`effectDescription` / `germanEffectDescription`.

When you add or edit content, **fill in both languages and keep them in sync.** Examples
from the data: "Wolliges Häschen" (Fuzzy Bunny), "Pastell-Küken" (Pastel Chick),
"Schlummer-Kätzchen" (Sleepy Kitty).
