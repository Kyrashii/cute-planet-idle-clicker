export interface ZodiacSpec {
  id: string;
  name: string;
  germanName: string;
  emoji: string;
  description: string;
  germanDescription: string;
  bonusDesc: string;
  germanBonusDesc: string;
  bonusType:
    | "click_crit"
    | "animals_boost"
    | "offline_boost"
    | "events_boost"
    | "missions_boost"
    | "stars_boost"
    | "click_flat"
    | "glitter_boost"
    | "cosmetic_discount"
    | "all_passive_boost";
}

export const ZODIACS: ZodiacSpec[] = [
  {
    id: "katze",
    name: "Cat",
    germanName: "Katze",
    emoji: "🐱",
    description:
      "Improves critical clicks to a 20% chance for 7x power (default: 5% chance for 3x).",
    germanDescription:
      "Verbessert kritische Klicks auf eine Chance von 20% fuer 7x Kraft (Standard: 5% Chance auf 3x).",
    bonusDesc: "20% crit chance and 7x crit power",
    germanBonusDesc: "20% Crit-Chance & 7x Crit-Kraft",
    bonusType: "click_crit",
  },
  {
    id: "biene",
    name: "Bee",
    germanName: "Biene",
    emoji: "🐝",
    description: "Every animal passively generates 35% more energy.",
    germanDescription: "Jedes Tier generiert passiv 35% mehr Energie.",
    bonusDesc: "+35% animal production",
    germanBonusDesc: "+35% Tier-Produktion",
    bonusType: "animals_boost",
  },
  {
    id: "mond",
    name: "Moon",
    germanName: "Mond",
    emoji: "🌙",
    description:
      "Moon Storm raises your maximum moon count by 1 and adds 50 percentage points to the production multiplier of every moon.",
    germanDescription:
      "Mond-Sturm erhoeht deine maximale Anzahl an Monden um 1 und verstaerkt den Produktionsbonus um 50 Prozentpunkte pro Mond.",
    bonusDesc: "+1 moon limit and +225% moon multiplier",
    germanBonusDesc: "+1 Mondlimit & +225% Mondmultiplikator",
    bonusType: "all_passive_boost",
  },
  {
    id: "drache",
    name: "Dragon",
    germanName: "Drache",
    emoji: "🐉",
    description:
      "All cosmic event bonuses, including meteor, aurora, and supernova effects, are 40% stronger.",
    germanDescription:
      "Alle kosmischen Event-Boni, darunter Meteor-, Aurora- und Supernova-Effekte, sind 40% staerker.",
    bonusDesc: "+40% stronger events",
    germanBonusDesc: "+40% staerkere Events",
    bonusType: "events_boost",
  },
  {
    id: "frosch",
    name: "Frog",
    germanName: "Frosch",
    emoji: "🐸",
    description: "Reduces mission durations and cooldowns by 35%.",
    germanDescription: "Verringert Missionszeiten und -Cooldowns um 35%.",
    bonusDesc: "-35% mission timers and cooldowns",
    germanBonusDesc: "-35% Missionstimer & Cooldowns",
    bonusType: "missions_boost",
  },
  {
    id: "fuchs",
    name: "Fox",
    germanName: "Fuchs",
    emoji: "🦊",
    description: "Permanently increases your manual click power by 40%.",
    germanDescription: "Erhoeht deine manuelle Klickkraft dauerhaft um 40%.",
    bonusDesc: "+40% click power",
    germanBonusDesc: "+40% Klickkraft",
    bonusType: "click_flat",
  },
  {
    id: "eule",
    name: "Owl",
    germanName: "Eule",
    emoji: "🦉",
    description: "Increases the energy production of your stars by 30%.",
    germanDescription: "Erhoeht die Energieproduktion deiner Sterne um 30%.",
    bonusDesc: "+30% star production",
    germanBonusDesc: "+30% Sternen-Produktion",
    bonusType: "stars_boost",
  },
  {
    id: "schildkroete",
    name: "Turtle",
    germanName: "Schildkroete",
    emoji: "🐢",
    description: "Increases your total passive income by 20%.",
    germanDescription: "Erhoeht dein gesamtes passives Einkommen (LPS) um 20%.",
    bonusDesc: "+20% total LPS",
    germanBonusDesc: "+20% Gesamt-LPS",
    bonusType: "all_passive_boost",
  },
  {
    id: "einhorn",
    name: "Unicorn",
    germanName: "Einhorn",
    emoji: "🦄",
    description: "Reduces the prices of all cosmetic upgrades by 20%.",
    germanDescription: "Reduziert die Preise aller Kosmetik-Upgrades um 20%.",
    bonusDesc: "-20% cosmetic prices",
    germanBonusDesc: "-20% Kosmetik-Preise",
    bonusType: "cosmetic_discount",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    germanName: "Phoenix",
    emoji: "🐦‍🔥",
    description: "Gain 35% more glitter dust from every source.",
    germanDescription: "Erhalte 35% mehr Glitzerstaub aus allen Quellen.",
    bonusDesc: "+35% glitter dust yield",
    germanBonusDesc: "+35% Glitzerstaub-Ausbeute",
    bonusType: "glitter_boost",
  },
];

export function getZodiac(id?: string): ZodiacSpec {
  if (!id) return ZODIACS[0];
  return ZODIACS.find((zodiac) => zodiac.id === id) || ZODIACS[0];
}
