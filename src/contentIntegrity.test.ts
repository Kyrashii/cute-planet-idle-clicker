import { describe, expect, it } from "vitest";
import { CONSTELLATIONS_LIST } from "./components/modals/StarsModal";
import { COSMIC_EVENTS_POOL } from "./data/cosmicEvents";
import { CRAFTING_RECIPES } from "./data/recipes";
import { STATIC_UPGRADES } from "./data/upgrades";
import { ZODIACS } from "./data/zodiacs";
import { TASK_TEMPLATES } from "./game/planetTasks";
import { ROGUELITE_BOON_PREVIEWS, ROGUELITE_BOONS, ROGUELITE_EVENT_POOL } from "./roguelite/data";

function expectUniqueWhitespaceFreeIds(label: string, ids: string[]) {
  expect(new Set(ids).size, `${label} IDs must be unique`).toBe(ids.length);
  ids.forEach((id) => {
    expect(id.trim(), `${label} ID must not be empty`).not.toBe("");
    expect(id, `${label} ID "${id}" must not contain whitespace`).not.toMatch(/\s/);
  });
}

function expectNonempty(label: string, values: string[]) {
  values.forEach((value) => {
    expect(value.trim(), `${label} must not be empty`).not.toBe("");
  });
}

function expectPositiveInteger(label: string, value: number) {
  expect(Number.isInteger(value), `${label} must be an integer`).toBe(true);
  expect(value, `${label} must be positive`).toBeGreaterThan(0);
}

describe("content integrity", () => {
  it("uses unique, whitespace-free IDs in standardized datasets", () => {
    expectUniqueWhitespaceFreeIds(
      "zodiac",
      ZODIACS.map((zodiac) => zodiac.id),
    );
    expectUniqueWhitespaceFreeIds(
      "recipe",
      CRAFTING_RECIPES.map((recipe) => recipe.id),
    );
    expectUniqueWhitespaceFreeIds(
      "recipe result",
      Array.from(new Set(CRAFTING_RECIPES.map((recipe) => recipe.result.id))),
    );
    expectUniqueWhitespaceFreeIds(
      "cosmic event",
      COSMIC_EVENTS_POOL.map((event) => event.id),
    );
    expectUniqueWhitespaceFreeIds(
      "cosmic event option",
      COSMIC_EVENTS_POOL.flatMap((event) => event.options.map((option) => option.id)),
    );
    expectUniqueWhitespaceFreeIds(
      "planet task",
      TASK_TEMPLATES.map((task) => task.id),
    );
    expectUniqueWhitespaceFreeIds(
      "roguelite boon",
      ROGUELITE_BOONS.map((boon) => boon.id),
    );
    expectUniqueWhitespaceFreeIds(
      "roguelite event",
      ROGUELITE_EVENT_POOL.map((event) => event.id),
    );
    expectUniqueWhitespaceFreeIds(
      "roguelite event choice",
      ROGUELITE_EVENT_POOL.flatMap((event) => event.choices.map((choice) => choice.id)),
    );
  });

  it("uses positive integer recipe quantities and resolvable item ingredients", () => {
    const producedItemIds = new Set(CRAFTING_RECIPES.map((recipe) => recipe.result.id));

    CRAFTING_RECIPES.forEach((recipe) => {
      expectPositiveInteger(`${recipe.id} result quantity`, recipe.result.quantity);

      const resourceIngredients = [
        recipe.ingredients.life,
        recipe.ingredients.stars,
        recipe.ingredients.moons,
        recipe.ingredients.glitter,
        recipe.ingredients.lootboxes,
      ].filter((quantity): quantity is number => quantity !== undefined);
      resourceIngredients.forEach((quantity) =>
        expectPositiveInteger(`${recipe.id} resource ingredient`, quantity),
      );

      Object.entries(recipe.ingredients.items ?? {}).forEach(([itemId, quantity]) => {
        expect(itemId).not.toMatch(/\s/);
        expect(producedItemIds.has(itemId), `${recipe.id} references unknown item ${itemId}`).toBe(
          true,
        );
        expectPositiveInteger(`${recipe.id} ingredient ${itemId}`, quantity);
      });
    });
  });

  it("uses positive integer instant cosmic-event rewards", () => {
    COSMIC_EVENTS_POOL.forEach((event) => {
      event.options.forEach((option) => {
        [option.bonusLife, option.bonusStars, option.bonusDust, option.bonusMoons]
          .filter((quantity): quantity is number => quantity !== undefined)
          .forEach((quantity) => expectPositiveInteger(`${option.id} reward`, quantity));
      });
    });
  });

  it("provides nonempty English and German zodiac copy", () => {
    ZODIACS.forEach((zodiac) => {
      expectNonempty(zodiac.id, [
        zodiac.name,
        zodiac.germanName,
        zodiac.description,
        zodiac.germanDescription,
        zodiac.bonusDesc,
        zodiac.germanBonusDesc,
      ]);
    });
  });

  it("provides nonempty English and German recipe copy", () => {
    CRAFTING_RECIPES.forEach((recipe) => {
      expectNonempty(recipe.id, [
        recipe.name,
        recipe.germanName,
        recipe.description,
        recipe.germanDescription,
        recipe.result.name,
        recipe.result.germanName,
        recipe.result.description,
        recipe.result.germanDescription,
      ]);
    });
  });

  it("provides nonempty English and German cosmic-event copy", () => {
    COSMIC_EVENTS_POOL.forEach((event) => {
      expectNonempty(event.id, [
        event.name,
        event.germanName,
        event.description,
        event.germanDescription,
      ]);
      event.options.forEach((option) => {
        expectNonempty(option.id, [
          option.name,
          option.germanName,
          option.description,
          option.germanDescription,
        ]);
      });
    });
  });

  it("provides nonempty English and German planet-task copy", () => {
    TASK_TEMPLATES.forEach((task) => {
      expectNonempty(task.id, [
        task.name,
        task.germanName,
        task.description(3, "Bunny", "🐇"),
        task.germanDescription(3, "Haeschen", "🐇"),
      ]);
      expectPositiveInteger(
        `${task.id} target`,
        Math.max(1, Math.round(task.targetFormula(10, 2))),
      );
    });
  });

  it("provides nonempty English and German roguelite boon and event copy", () => {
    ROGUELITE_BOONS.forEach((boon) => {
      expectNonempty(boon.id, [
        boon.title,
        boon.germanTitle,
        boon.description,
        boon.germanDescription,
      ]);
    });

    ROGUELITE_EVENT_POOL.forEach((event) => {
      expectNonempty(event.id, [
        event.title,
        event.germanTitle,
        event.description,
        event.germanDescription,
      ]);
      event.choices.forEach((choice) => {
        expectNonempty(choice.id, [
          choice.title,
          choice.germanTitle,
          choice.description,
          choice.germanDescription,
        ]);
      });
    });

    expect(Object.keys(ROGUELITE_BOON_PREVIEWS).sort()).toEqual(
      ROGUELITE_BOONS.map((boon) => boon.id).sort(),
    );
  });

  it("does not advertise removed XP mechanics in upgrade or constellation copy", () => {
    const removedXpTerms = /\b(?:xp|exp|ep)\b|erfahrung/i;

    STATIC_UPGRADES.forEach((upgrade) => {
      expect(upgrade.effectDescription).not.toMatch(removedXpTerms);
      expect(upgrade.germanEffectDescription).not.toMatch(removedXpTerms);
    });
    CONSTELLATIONS_LIST.forEach((constellation) => {
      expect(constellation.bonusText).not.toMatch(removedXpTerms);
      expect(constellation.germanDescription).not.toMatch(removedXpTerms);
    });
  });
});
