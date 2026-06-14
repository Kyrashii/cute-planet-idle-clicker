import { GameState, Animal, Upgrade } from "./types";
import { INITIAL_ANIMALS, calculateCost } from "./data";

// Static level bounds matching App.tsx
const EXP_PER_LEVEL = [0, 1500, 5000, 18000, 60000, 220000, 850000, 3200000, 12000000, 45000000];

// ROMAN NUMERAL LIST for Achievements
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

interface WorkerState {
  life: number;
  totalLifeEarned: number;
  starsCount: number;
  purchasedAnimals: Record<string, number>;
  purchasedUpgrades: string[];
  planetLevel: number;
  planetExp: number;
  clicksCount: number;
  starClicksTriggered: number;
  secondsPlayed: number;
  isNight: boolean;
  cycleProgress: number;
  activeEvent: "meteors" | "aurora" | "shooting_stars" | "supernova" | "black_hole" | null;
  activeEventDecision: "sammeln" | "erforschen" | "zerlegen" | "ignorieren" | null;
  eventTimeRemaining: number;
  prestigeCount: number;
  moonsCount: number;
  constellations: Record<string, number>;
  unlockedCosmetics: string[];
  cosmeticRarityLevels: Record<string, string>;
  glitterDust: number;
  shootingStarsCount: number;
  blackHoleSize?: number;
}

// Default initial state
let state: WorkerState = {
  life: 0,
  totalLifeEarned: 0,
  starsCount: 0,
  purchasedAnimals: {},
  purchasedUpgrades: [],
  planetLevel: 1,
  planetExp: 0,
  clicksCount: 0,
  starClicksTriggered: 0,
  secondsPlayed: 0,
  isNight: true,
  cycleProgress: 0,
  activeEvent: null,
  activeEventDecision: null,
  eventTimeRemaining: 120,
  prestigeCount: 0,
  moonsCount: 0,
  constellations: {},
  unlockedCosmetics: [],
  cosmeticRarityLevels: {},
  glitterDust: 0,
  shootingStarsCount: 0,
  blackHoleSize: 1,
};

// Timers refs
let gameTimerId: any = null;
let secondaryTimerId: any = null;
let starTimerId: any = null;
let cycleTimerId: any = null;
let eventTimerId: any = null;

// Derived variables calculations
function getLpsAndStats() {
  const purchasedUpgrades = state.purchasedUpgrades;
  const purchasedAnimals = state.purchasedAnimals;
  const starsCount = state.starsCount;
  const isNight = state.isNight;
  const activeEvent = state.activeEvent;

  // 🧩 SETBONI CHECK (Kosmischer Set-Harmonisierer)
  const hasSetBonusSet = purchasedUpgrades.includes("upg-glitter-set");
  let sakuraSetComplete = false;
  let cyberSetComplete = false;
  let goldSetComplete = false;
  let ghostSetComplete = false;
  let butterflySetComplete = false;

  if (hasSetBonusSet && state.unlockedCosmetics) {
    const list = state.unlockedCosmetics || [];
    sakuraSetComplete = ["star_pink", "acc_flower_crown", "moon_sakura"].every(id => list.includes(id));
    cyberSetComplete = ["star_cyber", "acc_space_glasses", "moon_cyber"].every(id => list.includes(id));
    goldSetComplete = ["star_gold", "acc_star_crown", "moon_gold"].every(id => list.includes(id));
    ghostSetComplete = ["star_ghostly", "frame_ghost", "moon_ghost"].every(id => list.includes(id));
    butterflySetComplete = ["star_butterfly", "acc_butterfly_wings", "frame_butterfly", "moon_butterfly"].every(id => list.includes(id));
  }

  // Upgrades specifications check
  const upgradesSpecs = {
    bunnyBoost: purchasedUpgrades.includes("upg-bunny-1"),
    chickBoost: purchasedUpgrades.includes("upg-chick-1"),
    catBoost: purchasedUpgrades.includes("upg-cat-1"),
    frogBoost: purchasedUpgrades.includes("upg-frog-1"),
    koalaBoost: purchasedUpgrades.includes("upg-koala-1"),
    pandaBoost: purchasedUpgrades.includes("upg-panda-1"),
    unicornBoost: purchasedUpgrades.includes("upg-unicorn-1"),
    globalAnimalsBoost: purchasedUpgrades.includes("upg-global-1"),
    
    starGlow: purchasedUpgrades.includes("upg-star-glow"),
    starPulse: purchasedUpgrades.includes("upg-star-pulse"),
    starSupercharger: purchasedUpgrades.includes("upg-star-supercharger"),
  };

  // Click power calculation (raw click power for upgrades synergy)
  let rawClickPower = 1;
  if (purchasedUpgrades.includes("upg-click-1")) rawClickPower += 1;
  if (purchasedUpgrades.includes("upg-click-2")) rawClickPower += 5;
  if (purchasedUpgrades.includes("upg-click-3")) rawClickPower += 25;
  if (purchasedUpgrades.includes("upg-click-4")) rawClickPower += 150;
  if (purchasedUpgrades.includes("upg-click-5")) rawClickPower += 1000;
  if (purchasedUpgrades.includes("upg-click-multiplier")) rawClickPower *= 2;

  // Click power with DAYTIME BONUS: own clicks are 1.5x stronger during day (isNight === false)
  let clickPower = rawClickPower;
  if (!isNight) {
    clickPower = Math.floor(clickPower * 1.5);
  } else if (ghostSetComplete) {
    // Ghost set gives 2.5x click power during night periods
    clickPower = Math.floor(clickPower * 2.5);
  }

  // XP multiplier calculation based on Research upgrades
  let xpMultiplier = 1.0;
  if (purchasedUpgrades.includes("upg-xp-1")) xpMultiplier += 0.5;
  if (purchasedUpgrades.includes("upg-xp-2")) xpMultiplier += 0.5;
  if (purchasedUpgrades.includes("upg-xp-3")) xpMultiplier += 0.5;
  if (purchasedUpgrades.includes("upg-xp-4")) xpMultiplier += 0.5;
  if (purchasedUpgrades.includes("upg-xp-5")) xpMultiplier += 1.0;
  if (purchasedUpgrades.includes("upg-star-magnetic")) xpMultiplier += 1.0;
  if (purchasedUpgrades.includes("upg-cosmic-eternity")) xpMultiplier *= 3.0;

  // Schmetterling Set complete (+25% XP-Multiplikator)
  if (butterflySetComplete) {
    xpMultiplier += 0.25;
  }

  // Constellation Level Helpers
  const constellKuschelLevel = state.constellations?.kuschel || 0;
  const constellMondhasenLevel = state.constellations?.mondhasen || 0;
  const constellSupernovaLevel = state.constellations?.supernova || 0;
  const constellSternenstaubLevel = state.constellations?.stardust_rain || 0;
  const constellHarmonieLevel = state.constellations?.cosmic_harmony || 0;

  // Sternenstaub bonus to XP (+15% more EXP earned per level)
  xpMultiplier += constellSternenstaubLevel * 0.15;

  // 🌌 EVENT DECISIONS ADJUSTMENTS
  const decision = state.activeEventDecision;

  // Event multipliers computations
  let clickMultiplierForEvents = 1.0;
  if (activeEvent === "meteors") {
    let baseClickAdd = 4.0;
    if (decision === "sammeln") {
      baseClickAdd = 8.0; // Meteors Collect mode -> mehr Leben! (+800%)
    } else if (decision === "ignorieren") {
      baseClickAdd = 1.5; // Meteors Ignore mode -> smaller bonus
    }
    clickMultiplierForEvents += baseClickAdd;
    if (purchasedUpgrades.includes("upg-event-meteor")) {
      clickMultiplierForEvents += (decision === "sammeln" ? 8.0 : decision === "ignorieren" ? 2.0 : 5.0);
    }
  }

  let starMultiplierForEvents = 1.0;
  if (activeEvent === "aurora") {
    let baseStarAdd = 2.0;
    if (decision === "sammeln") {
      baseStarAdd = 5.5; // Star collect mode -> mehr Leben (Sterne)! (+550%)
    } else if (decision === "ignorieren") {
      baseStarAdd = 0.8; // Smaller bonus
    }
    starMultiplierForEvents += baseStarAdd;
    if (purchasedUpgrades.includes("upg-event-aurora")) {
      starMultiplierForEvents += (decision === "sammeln" ? 5.0 : decision === "ignorieren" ? 1.0 : 3.0);
    }
  }

  let animalMultiplierForEvents = 1.0;
  if (activeEvent === "shooting_stars") {
    let baseAnimalAdd = 2.0;
    if (decision === "sammeln") {
      baseAnimalAdd = 5.5; // Animal warm cuddle -> mehr Leben (Tiere)! (+550%)
    } else if (decision === "ignorieren") {
      baseAnimalAdd = 0.8;
    }
    animalMultiplierForEvents += baseAnimalAdd;
    if (purchasedUpgrades.includes("upg-animal-synergy-1")) {
      animalMultiplierForEvents += (decision === "sammeln" ? 2.0 : decision === "ignorieren" ? 0.4 : 1.0);
    }
  }

  let xpEventMultiplier = 1.0;
  if (activeEvent === "supernova") {
    let baseXpMult = 3.0;
    if (decision === "erforschen") {
      baseXpMult = 6.0; // Research mode -> mehr XP (+500% / 6x XP)
    } else if (decision === "ignorieren") {
      baseXpMult = 1.5;
    }
    xpEventMultiplier *= baseXpMult;
    if (purchasedUpgrades.includes("upg-event-supernova")) {
      xpEventMultiplier *= (decision === "erforschen" ? 3.0 : decision === "ignorieren" ? 1.2 : 2.0);
    }
  } else if (activeEvent === "meteors") {
    let baseXpMult = 2.0;
    if (decision === "erforschen") {
      baseXpMult = 4.5; // Research mode -> mehr XP!
    } else if (decision === "ignorieren") {
      baseXpMult = 1.2;
    }
    xpEventMultiplier *= baseXpMult;
  } else if (activeEvent === "aurora" && decision === "erforschen") {
    xpEventMultiplier *= 3.0; // Aurora photography -> more XP!
  } else if (activeEvent === "shooting_stars" && decision === "erforschen") {
    xpEventMultiplier *= 3.0; // Star drop logging -> more XP!
  }

  // Constellation Supernova Power Boosts (+20% per level)
  const supernovaBoost = 1.0 + constellSupernovaLevel * 0.20;
  if (activeEvent) {
    clickMultiplierForEvents *= supernovaBoost;
    starMultiplierForEvents *= supernovaBoost;
    animalMultiplierForEvents *= supernovaBoost;
    xpEventMultiplier *= supernovaBoost;
  }

  // Calculate Star Autoclick Power
  let starPowerPerStar = 1.0;
  if (upgradesSpecs.starGlow) starPowerPerStar += 1.0;
  if (upgradesSpecs.starPulse) starPowerPerStar += 5.0;
  const clickBonus = (rawClickPower - 1) * 0.20;
  starPowerPerStar += clickBonus;
  if (upgradesSpecs.starSupercharger) starPowerPerStar *= 2.0;
  if (isNight) {
    // Ghost Set boosts the night star reward from 1.5x to 4.0x
    starPowerPerStar = starPowerPerStar * (ghostSetComplete ? 4.0 : 1.5);
  }

  // Prestige Multiplier (10% bonus per Prestige level)
  const prestigeMultiplier = 1 + (state.prestigeCount || 0) * 0.10;

  // Apply prestige bonus to star power and manual click power
  starPowerPerStar *= prestigeMultiplier;
  clickPower = Math.ceil(clickPower * prestigeMultiplier);

  // Apply Cosmic Harmony bonus to clicks and stars (+8% per level)
  const harmonieMulti = 1.0 + constellHarmonieLevel * 0.08;
  clickPower = Math.ceil(clickPower * harmonieMulti);
  starPowerPerStar *= harmonieMulti;

  // Cyber Set gives +15% Sterne power
  let finalStarPowerPos = starPowerPerStar;
  if (cyberSetComplete) {
    finalStarPowerPos *= 1.15;
  }

  const totalStarsLps = starsCount * finalStarPowerPos;

  // Calculate Animal LPS
  let totalAnimalsLps = 0;
  const animalLpsMap: Record<string, number> = {};
  
  INITIAL_ANIMALS.forEach((def) => {
    let multiplier = 1.0;
    if (def.id === "bunny" && upgradesSpecs.bunnyBoost) multiplier *= 2.0;
    if (def.id === "chick" && upgradesSpecs.chickBoost) multiplier *= 2.0;
    if (def.id === "cat" && upgradesSpecs.catBoost) multiplier *= 2.0;
    if (def.id === "frog" && upgradesSpecs.frogBoost) multiplier *= 2.0;
    if (def.id === "koala" && upgradesSpecs.koalaBoost) multiplier *= 2.0;
    if (def.id === "panda" && upgradesSpecs.pandaBoost) multiplier *= 2.0;
    if (def.id === "unicorn" && upgradesSpecs.unicornBoost) multiplier *= 2.0;
    if (upgradesSpecs.globalAnimalsBoost) multiplier *= 1.5;

    const quantity = purchasedAnimals[def.id] || 0;
    let lps = quantity * def.baseLps * multiplier;
    // Apply prestige bonus to the animal LPS
    lps *= prestigeMultiplier;
    // Apply Kuschel-Sternbild Animal LPS bonus (+10% per level)
    lps *= (1.0 + constellKuschelLevel * 0.10);
    animalLpsMap[def.id] = lps;
    totalAnimalsLps += lps;
  });

  // Calculate Moons bonuses (Flat + Global Multiplier)
  const flatMoonLps = (state.moonsCount || 0) * 15000 * prestigeMultiplier;

  // Aggregate Life Per Second (LPS)
  let totalLps = (totalAnimalsLps * animalMultiplierForEvents) + (totalStarsLps * starMultiplierForEvents) + flatMoonLps;
  if (purchasedUpgrades.includes("upg-nexus-core")) {
    totalLps *= 1.40;
  }

  // Gold Set complete (+5% alles!)
  if (goldSetComplete) {
    totalLps *= 1.05;
  }

  // Schmetterling Set complete (+15% Alles-Generierung!)
  if (butterflySetComplete) {
    totalLps *= 1.15;
  }

  // ✨ RARITY UPGRADE BONUS CHECK
  let rarityUpgradeMultiplier = 1.0;
  if (purchasedUpgrades.includes("upg-glitter-rarity") && state.cosmeticRarityLevels) {
    Object.keys(state.cosmeticRarityLevels).forEach((id) => {
      const level = state.cosmeticRarityLevels[id];
      if (level === "rare") rarityUpgradeMultiplier += 0.02;
      else if (level === "epic") rarityUpgradeMultiplier += 0.05;
      else if (level === "legendary") rarityUpgradeMultiplier += 0.12;
    });
  }
  totalLps *= rarityUpgradeMultiplier;

  // Apply Moon global multiplier (+150% total LPS per Moon)
  if (state.moonsCount && state.moonsCount > 0) {
    totalLps *= (1.0 + state.moonsCount * 1.50);
  }

  // Aggregate quantities
  const totalAnimalsCount = Object.values(purchasedAnimals).reduce((sum, qty) => sum + qty, 0);
  const researchedUpgradesCount = purchasedUpgrades.length;

  // EXP needed to level up the planet based on current level
  const nextIdx = state.planetLevel;
  let planetExpNeeded = 45000000;
  if (nextIdx < EXP_PER_LEVEL.length) {
    planetExpNeeded = EXP_PER_LEVEL[nextIdx];
  } else {
    planetExpNeeded = 45000000 + (state.planetLevel - 9) * 20000000;
  }

  return {
    upgradesSpecs,
    clickPower,
    rawClickPower,
    xpMultiplier,
    clickMultiplierForEvents,
    starMultiplierForEvents,
    animalMultiplierForEvents,
    xpEventMultiplier,
    starPowerPerStar,
    totalStarsLps,
    totalAnimalsLps,
    flatMoonLps,
    totalLps,
    totalAnimalsCount,
    researchedUpgradesCount,
    planetExpNeeded,
    prestigeCount: state.prestigeCount || 0,
    prestigeMultiplier,
    moonsCount: state.moonsCount || 0,
  };
}

// Calculations helper for formatting inside compact loops
function formatCompactNumber(num: number): string {
  if (num === null || isNaN(num)) return "0";
  if (num < 1000) {
    if (num === 0) return "0";
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  }
  const suffixes = [
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "Qa" },
    { value: 1e18, symbol: "Qi" },
    { value: 1e21, symbol: "Sx" },
    { value: 1e24, symbol: "Sp" },
    { value: 1e27, symbol: "Oc" },
    { value: 1e30, symbol: "No" },
    { value: 1e33, symbol: "Dc" },
    { value: 1e36, symbol: "Ud" },
    { value: 1e39, symbol: "Dd" },
    { value: 1e42, symbol: "Td" },
    { value: 1e45, symbol: "Qad" },
  ];
  for (let i = suffixes.length - 1; i >= 0; i--) {
    if (num >= suffixes[i].value) {
      const formatted = (num / suffixes[i].value).toFixed(2);
      return parseFloat(formatted) + suffixes[i].symbol;
    }
  }
  return num.toString();
}

// Achievements Generation (120 items total: recalculated in Worker thread)
function generateAchievements() {
  const stats = getLpsAndStats();
  const totalLifeEarned = state.totalLifeEarned;
  const clicksCount = state.clicksCount;
  const starsCount = state.starsCount;
  const starClicksTriggered = state.starClicksTriggered;
  const planetLevel = state.planetLevel;
  const totalAnimalsCount = stats.totalAnimalsCount;
  const researchedUpgradesCount = stats.researchedUpgradesCount;
  const secondsPlayed = state.secondsPlayed;

  const families = [
    {
      category: "life",
      emoji: "💖",
      titlePrefix: "Lebensmeister",
      desc: (target: number) => `Sammle insgesamt ${formatCompactNumber(target)} Leben`,
      currentValue: totalLifeEarned,
      targets: [100, 500, 2500, 10000, 50000, 250000, 1000000, 5000000, 25000000, 100000000, 500000000, 2500000000, 10000000000, 50000000000, 100000000000],
    },
    {
      category: "clicks",
      emoji: "⚡",
      titlePrefix: "Kosmischer Klicker",
      desc: (target: number) => `Klicke insgesamt ${target.toLocaleString()} Mal manuell auf den Planeten`,
      currentValue: clicksCount,
      targets: [5, 20, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000, 50000, 100000, 250000, 500000],
    },
    {
      category: "stars",
      emoji: "⭐",
      titlePrefix: "Sternenrufer",
      desc: (target: number) => `Besitze insgesamt ${target} fliegende Sterne`,
      currentValue: starsCount,
      targets: [1, 2, 3, 4, 5, 8, 12, 16, 20, 25, 30, 35, 40, 45, 50],
    },
    {
      category: "star_clicks",
      emoji: "✧",
      titlePrefix: "Sternenstaub-Sammler",
      desc: (target: number) => `Sterne brüten und klicken ${target.toLocaleString()} Mal automatisch`,
      currentValue: starClicksTriggered,
      targets: [10, 50, 200, 1000, 5000, 20000, 100000, 500000, 2000000, 10000000, 50000000, 200000000, 1000000000, 5000000000, 10000000000],
    },
    {
      category: "planet_level",
      emoji: "🪐",
      titlePrefix: "Welten-Evolutionär",
      desc: (target: number) => `Entwickle deinen niedlichen Planeten bis auf Stufe ${target}`,
      currentValue: planetLevel,
      targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 20],
    },
    {
      category: "animals",
      emoji: "🐾",
      titlePrefix: "Tierfreund",
      desc: (target: number) => `Besitze insgesamt ${target} niedliche Tiere`,
      currentValue: totalAnimalsCount,
      targets: [1, 5, 10, 20, 35, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400],
    },
    {
      category: "upgrades",
      emoji: "🔬",
      titlePrefix: "Forschungs-Doktor",
      desc: (target: number) => `Erforsche insgesamt ${target} Technologien`,
      currentValue: researchedUpgradesCount,
      targets: [1, 2, 3, 4, 5, 7, 10, 12, 15, 18, 20, 22, 24, 26, 28],
    },
    {
      category: "time",
      emoji: "⏳",
      titlePrefix: "Zeit-Reisender",
      desc: (target: number) => `Spielzeit insgesamt im gemütlichen Kosmos: ${target >= 3600 ? Math.floor(target/3600) + ' Std.' : Math.floor(target/60) + ' Min.'}`,
      currentValue: secondsPlayed,
      targets: [10, 30, 60, 120, 300, 600, 1200, 2400, 3600, 7200, 14400, 28800, 57600, 86400, 172800],
    },
  ];

  const list: any[] = [];
  families.forEach((fam) => {
    fam.targets.forEach((target, idx) => {
      const roman = ROMAN_NUMERALS[idx] || (idx + 1).toString();
      const value = fam.currentValue;
      list.push({
        id: `ach-${fam.category}-${target}`,
        title: `${fam.titlePrefix} ${roman}`,
        description: fam.desc(target),
        category: fam.category,
        progress: Math.min(value, target),
        target: target,
        isUnlocked: value >= target,
        emoji: fam.emoji,
      });
    });
  });

  return list;
}

// Check and trigger planet level ups
function addPlanetExp(amount: number) {
  let currentExp = state.planetExp + amount;
  let currentLevel = state.planetLevel;
  let leveledUp = false;

  while (true) {
    const expBound = EXP_PER_LEVEL[currentLevel] || (45000000 + (currentLevel - 9) * 20000000);
    if (currentExp >= expBound) {
      currentExp -= expBound;
      currentLevel += 1;
      leveledUp = true;
    } else {
      break;
    }
  }

  state.planetExp = currentExp;
  if (leveledUp) {
    state.planetLevel = currentLevel;
    postMessage({
      type: "LEVEL_UP",
      level: currentLevel,
    });
  }
}

let cachedAchievementsObj: any[] = [];
let lastAchievementsCalcTime = 0;

// State Broadcaster
function broadcastStateUpdate(forceRecalculateAchievements = false) {
  const calculations = getLpsAndStats();
  
  // Throttle achievements calculation to once every 1250ms unless forced by a buy/click event
  const now = Date.now();
  if (forceRecalculateAchievements || cachedAchievementsObj.length === 0 || now - lastAchievementsCalcTime > 1250) {
    cachedAchievementsObj = generateAchievements();
    lastAchievementsCalcTime = now;
  }
  
  const achievements = cachedAchievementsObj;
  const unlockedAchievementsCount = achievements.filter((a: any) => a.isUnlocked).length;

  postMessage({
    type: "STATE_UPDATE",
    state: {
      life: state.life,
      totalLifeEarned: state.totalLifeEarned,
      starsCount: state.starsCount,
      purchasedAnimals: state.purchasedAnimals,
      purchasedUpgrades: state.purchasedUpgrades,
      planetLevel: state.planetLevel,
      planetExp: state.planetExp,
      clicksCount: state.clicksCount,
      starClicksTriggered: state.starClicksTriggered,
      secondsPlayed: state.secondsPlayed,
      isNight: state.isNight,
      cycleProgress: state.cycleProgress,
      activeEvent: state.activeEvent,
      activeEventDecision: state.activeEventDecision || null,
      eventTimeRemaining: state.eventTimeRemaining,
      prestigeCount: state.prestigeCount,
      moonsCount: state.moonsCount || 0,
      constellations: state.constellations || {},
      unlockedCosmetics: state.unlockedCosmetics || [],
      cosmeticRarityLevels: state.cosmeticRarityLevels || {},
      glitterDust: state.glitterDust || 0,
      shootingStarsCount: state.shootingStarsCount || 0,
      blackHoleSize: state.blackHoleSize || 1,
    },
    calculations: {
      ...calculations,
      unlockedAchievementsCount,
    },
    achievements,
  });
}

// ---------------------------------------------------------------------------
// Worker Loop initializations
// ---------------------------------------------------------------------------
function startTimers() {
  stopTimers();

  // 1. Core Incremental game tick (every 250ms instead of 100ms for extreme mobile performance)
  gameTimerId = setInterval(() => {
    const stats = getLpsAndStats();
    const increment = stats.totalLps / 4;
    if (increment > 0) {
      state.life += increment;
      state.totalLifeEarned += increment;
    }
    broadcastStateUpdate();
  }, 250);

  // 2. Seconds played ticker (every 1000ms)
  secondaryTimerId = setInterval(() => {
    state.secondsPlayed += 1;
  }, 1000);

  // 3. Planet Cycle progress ticker (every 250ms)
  cycleTimerId = setInterval(() => {
    // Mondhasen-Sternbild bonus: Night lasts longer (slower cycleProgress during night)
    const constellMondhasenLvl = state.constellations?.mondhasen || 0;
    const progressModifier = state.isNight ? (1 / (1 + constellMondhasenLvl * 0.25)) : 1.0;
    
    const nextVal = state.cycleProgress + 0.4166667 * progressModifier;
    if (nextVal >= 100) {
      state.cycleProgress = 0;
      state.isNight = !state.isNight;
    } else {
      state.cycleProgress = nextVal;
    }
  }, 250);

  // 4. Star Auto-Clicks & Moon Pulsing sequence (every 1000ms)
  starTimerId = setInterval(() => {
    const stats = getLpsAndStats();
    let updated = false;

    if (state.starsCount > 0) {
      const reward = state.starsCount * stats.starPowerPerStar * stats.starMultiplierForEvents;
      state.starClicksTriggered += state.starsCount;

      postMessage({
        type: "STAR_TRIGGER",
        reward: reward,
        starsCount: state.starsCount,
      });

      addPlanetExp(state.starsCount * 1.0 * stats.xpMultiplier * stats.xpEventMultiplier);
      updated = true;
    }

    if (state.moonsCount && state.moonsCount > 0) {
      const prestigeMultiplier = 1 + (state.prestigeCount || 0) * 0.10;
      const moonReward = state.moonsCount * 15000 * prestigeMultiplier;

      postMessage({
        type: "MOON_TRIGGER",
        reward: moonReward,
        moonsCount: state.moonsCount,
      });

      addPlanetExp(state.moonsCount * 15 * stats.xpMultiplier * stats.xpEventMultiplier);
      updated = true;
    }

    if (updated) {
      broadcastStateUpdate();
    }
  }, 1000);

  // 5. Cosmic Random Event Manager (every 1000ms)
  eventTimerId = setInterval(() => {
    state.eventTimeRemaining -= 1;
    if (state.eventTimeRemaining <= 0) {
      if (state.activeEvent === null) {
        // Start random event
        const eventPool: ("meteors" | "aurora" | "shooting_stars" | "supernova" | "black_hole")[] = ["meteors", "aurora", "shooting_stars", "supernova"];
        if ((state.prestigeCount || 0) >= 5) {
          eventPool.push("black_hole");
        }
        const chosen = eventPool[Math.floor(Math.random() * eventPool.length)];
        state.activeEvent = chosen;
        state.activeEventDecision = "ignorieren";

        let duration = 120;
        if (state.purchasedUpgrades.includes("upg-event-duration")) {
          duration += 60;
        }
        // Since it starts with "ignorieren", we automatically add the extra 60s
        duration += 60;
        state.eventTimeRemaining = duration;

        if (state.purchasedUpgrades.includes("upg-quantum-tapper")) {
          const prestigeMultiplier = 1 + (state.prestigeCount || 0) * 0.10;
          const bonus = 1000 * prestigeMultiplier;
          state.life += bonus;
          state.totalLifeEarned += bonus;
        }

        postMessage({
          type: "EVENT_TRIGGER",
          event: chosen,
          active: true,
        });
      } else {
        // End current event
        state.activeEvent = null;
        state.activeEventDecision = null;

        let waitDuration = 120;
        if (state.purchasedUpgrades.includes("upg-event-frequency")) {
          waitDuration = 70;
        }
        
        // Ewiges Polarlicht reduces wait time by 15% per level
        const constellPolarlichtLvl = state.constellations?.ewiges_polarlicht || 0;
        waitDuration = Math.round(waitDuration * (1 - constellPolarlichtLvl * 0.15));
        
        state.eventTimeRemaining = waitDuration;

        postMessage({
          type: "EVENT_TRIGGER",
          event: null,
          active: false,
        });
      }
    }
  }, 1000);
}

function stopTimers() {
  if (gameTimerId) clearInterval(gameTimerId);
  if (secondaryTimerId) clearInterval(secondaryTimerId);
  if (cycleTimerId) clearInterval(cycleTimerId);
  if (starTimerId) clearInterval(starTimerId);
  if (eventTimerId) clearInterval(eventTimerId);
}

// Handle messages from UI
addEventListener("message", (e) => {
  const data = e.data;
  if (!data || !data.type) return;

  switch (data.type) {
    case "INIT": {
      if (data.savedState) {
        state = {
          ...state,
          ...data.savedState,
        };
      }
      startTimers();
      broadcastStateUpdate();
      break;
    }
    case "CLICK": {
      state.clicksCount += 1;
      const stats = getLpsAndStats();
      const actualClickLife = stats.clickPower * stats.clickMultiplierForEvents;
      const actualClickXP = 1.0 * stats.xpMultiplier * stats.xpEventMultiplier;

      state.life += actualClickLife;
      state.totalLifeEarned += actualClickLife;

      // 🌌 EVENT DECISION: "zerlegen" (Dismantle/Scan) DROP CHANCE
      if (state.activeEvent && state.activeEventDecision === "zerlegen") {
        const rand = Math.random() * 100;
        let starChance = state.activeEvent === "supernova" ? 4.0 : 2.0;
        
        // Only meteors, shooting_stars, and supernova give Shooting Star lootboxes directly
        const canDropLootbox = ["meteors", "shooting_stars", "supernova"].includes(state.activeEvent);
        
        if (canDropLootbox && rand < starChance) {
          state.shootingStarsCount = (state.shootingStarsCount || 0) + 1;
          postMessage({
            type: "COSMETIC_FOUND",
            text: "🌠 Sternschnuppe gefunden! (Lootbox)",
          });
        } else {
          // Otherwise roll for Glitzerstaub!
          const dustRand = Math.random() * 100;
          const dustChance = state.activeEvent === "aurora" ? 15.0 : state.activeEvent === "supernova" ? 15.0 : 10.0;
          if (dustRand < dustChance) {
            const amount = state.activeEvent === "supernova" ? 5 : 2;
            state.glitterDust = (state.glitterDust || 0) + amount;
            postMessage({
              type: "COSMETIC_FOUND",
              text: `+${amount} Glitzerstaub ✨ (Zerlegt)`,
            });
          }
        }
      }

      postMessage({
        type: "CLICK_EFFECT",
        actualClickLife,
        x: data.x,
        y: data.y,
      });

      addPlanetExp(actualClickXP);
      broadcastStateUpdate();
      break;
    }
    case "BUY_ANIMAL": {
      const { animalId, cost, countToBuy } = data;
      const amount = countToBuy || 1;
      if (state.life >= cost) {
        state.life -= cost;
        state.purchasedAnimals[animalId] = (state.purchasedAnimals[animalId] || 0) + amount;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_UPGRADES_BATCH": {
      const { upgradesList } = data; // Array of { id: string, cost: number, isGlitter: boolean }
      let updated = false;
      for (const item of upgradesList) {
        if (item.isGlitter) {
          if (state.glitterDust >= item.cost && !state.purchasedUpgrades.includes(item.id)) {
            state.glitterDust -= item.cost;
            state.purchasedUpgrades.push(item.id);
            updated = true;
          }
        } else {
          if (state.life >= item.cost && !state.purchasedUpgrades.includes(item.id)) {
            state.life -= item.cost;
            state.purchasedUpgrades.push(item.id);
            updated = true;
          }
        }
      }
      if (updated) {
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_STAR": {
      const { cost } = data;
      if (state.life >= cost) {
        state.life -= cost;
        state.starsCount += 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_UPGRADE": {
      const { id, cost } = data;
      if (state.life >= cost && !state.purchasedUpgrades.includes(id)) {
        state.life -= cost;
        state.purchasedUpgrades.push(id);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "CHIPS_CHEAT": {
      // Rewards matching manual 'uguu' keypress
      state.life += 1000000;
      state.totalLifeEarned += 1000000;
      state.starsCount += 2;
      state.purchasedAnimals.bunny = (state.purchasedAnimals.bunny || 0) + 1;
      state.purchasedAnimals.chick = (state.purchasedAnimals.chick || 0) + 1;
      state.purchasedAnimals.cat = (state.purchasedAnimals.cat || 0) + 1;
      state.purchasedAnimals.frog = (state.purchasedAnimals.frog || 0) + 1;
      
      broadcastStateUpdate(true);
      break;
    }
    case "RESET": {
      state = {
        life: 0,
        totalLifeEarned: 0,
        starsCount: 0,
        purchasedAnimals: {},
        purchasedUpgrades: [],
        planetLevel: 1,
        planetExp: 0,
        clicksCount: 0,
        starClicksTriggered: 0,
        secondsPlayed: 0,
        isNight: true,
        cycleProgress: 0,
        activeEvent: null,
        activeEventDecision: null,
        eventTimeRemaining: 120,
        prestigeCount: 0,
        moonsCount: 0,
        constellations: {},
        unlockedCosmetics: [],
        cosmeticRarityLevels: {},
        glitterDust: 0,
        shootingStarsCount: 0,
        blackHoleSize: 1,
      };
      broadcastStateUpdate(true);
      break;
    }
    case "PRESTIGE": {
      state.prestigeCount = (state.prestigeCount || 0) + 1;
      state.life = 0;
      state.totalLifeEarned = 0;
      state.starsCount = 0;
      state.purchasedAnimals = {};
      state.purchasedUpgrades = [];
      state.planetLevel = 1;
      state.planetExp = 0;
      state.clicksCount = 0;
      state.starClicksTriggered = 0;
      state.moonsCount = 0;
      state.constellations = {};
      broadcastStateUpdate(true);
      break;
    }
    case "INVEST_CONSTELLATION": {
      const { constellationId, starsCost, moonsCost } = data;
      const currentLevel = state.constellations?.[constellationId] || 0;
      if (state.starsCount >= starsCost && (state.moonsCount || 0) >= moonsCost) {
        state.starsCount -= starsCost;
        if (moonsCost > 0) {
          state.moonsCount = (state.moonsCount || 0) - moonsCost;
        }
        if (!state.constellations) {
          state.constellations = {};
        }
        state.constellations[constellationId] = currentLevel + 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "MERGE_MOONS": {
      let maxMoons = 3;
      const upgrades = state.purchasedUpgrades || [];
      if (upgrades.includes("upg-moon-limit-1")) maxMoons++;
      if (upgrades.includes("upg-moon-limit-2")) maxMoons++;
      if (upgrades.includes("upg-moon-limit-3")) maxMoons++;
      if (upgrades.includes("upg-moon-limit-4")) maxMoons++;
      if (upgrades.includes("upg-moon-limit-5")) maxMoons++;
      if (upgrades.includes("upg-moon-limit-6")) maxMoons++;
      if (upgrades.includes("upg-moon-limit-7")) maxMoons++;

      if (state.starsCount >= 50 && (state.moonsCount || 0) < maxMoons) {
        state.starsCount -= 50;
        state.moonsCount = (state.moonsCount || 0) + 1;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "SET_NIGHT_CYCLE_FORCE": {
      state.isNight = data.isNight;
      state.cycleProgress = 0;
      broadcastStateUpdate();
      break;
    }
    case "ADD_GLITTER_DUST": {
      const { amount } = data;
      state.glitterDust = (state.glitterDust || 0) + Number(amount);
      broadcastStateUpdate(true);
      break;
    }
    case "SPEND_GLITTER_DUST": {
      const { amount } = data;
      if (state.glitterDust >= amount) {
        state.glitterDust -= Number(amount);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "BUY_UPGRADE_GLITTER": {
      const { id, cost } = data;
      if (state.glitterDust >= cost && !state.purchasedUpgrades.includes(id)) {
        state.glitterDust -= cost;
        state.purchasedUpgrades.push(id);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UNLOCK_COSMETIC_DIRECT": {
      const { cosmeticId, cost } = data;
      if (state.glitterDust >= cost && !state.unlockedCosmetics.includes(cosmeticId)) {
        state.glitterDust -= cost;
        state.unlockedCosmetics.push(cosmeticId);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UNLOCK_COSMETIC_LOOTBOX": {
      const { cosmeticId } = data;
      if (!state.unlockedCosmetics.includes(cosmeticId)) {
        state.unlockedCosmetics.push(cosmeticId);
        broadcastStateUpdate(true);
      }
      break;
    }
    case "UPGRADE_COSMETIC_RARITY": {
      const { cosmeticId, targetRarity, cost } = data;
      if (state.glitterDust >= cost) {
        state.glitterDust -= cost;
        if (!state.cosmeticRarityLevels) {
          state.cosmeticRarityLevels = {};
        }
        state.cosmeticRarityLevels[cosmeticId] = targetRarity;
        broadcastStateUpdate(true);
      }
      break;
    }
    case "SET_EVENT_DECISION": {
      const { decision } = data;
      const previous = state.activeEventDecision;
      state.activeEventDecision = decision;
      if (decision === "ignorieren" && previous !== "ignorieren") {
        state.eventTimeRemaining += 60;
      } else if (decision !== "ignorieren" && previous === "ignorieren") {
        state.eventTimeRemaining = Math.max(5, state.eventTimeRemaining - 60);
      }
      broadcastStateUpdate();
      break;
    }
    case "UPDATE_SHOOTING_STARS": {
      state.shootingStarsCount = data.count;
      broadcastStateUpdate();
      break;
    }
    case "BLACK_HOLE_GAMBLE": {
      const { sacrificeType } = data;
      let cost = 0;
      let ok = false;
      if (sacrificeType === "life") {
        // Sacrifice 50% of life, minimum 10 million
        cost = Math.floor(state.life * 0.50);
        if (cost < 10000000) cost = 10000000;
        if (state.life >= cost) {
          state.life -= cost;
          ok = true;
        }
      } else if (sacrificeType === "stars") {
        // Sacrifice 25% of stars, minimum 10
        cost = Math.ceil(state.starsCount * 0.25);
        if (cost < 10) cost = 10;
        if (state.starsCount >= cost) {
          state.starsCount -= cost;
          ok = true;
        }
      } else if (sacrificeType === "dust") {
        // Sacrifice 50% of glitter dust, minimum 10
        cost = Math.ceil((state.glitterDust || 0) * 0.50);
        if (cost < 10) cost = 10;
        if ((state.glitterDust || 0) >= cost) {
          state.glitterDust -= cost;
          ok = true;
        }
      }

      if (ok) {
        // Roll outcome with equal 10% chance
        const roll = Math.floor(Math.random() * 10);
        let titleGerman = "";
        let textGerman = "";
        let type: "good" | "bad" = "good";

        const stats = getLpsAndStats();
        const baseLps = stats.totalStarsLps || 100;
        const holeMultiplier = 1 + ((state.blackHoleSize || 1) - 1) * 0.25;

        switch (roll) {
          // --- GOOD OUTCOMES (0, 1, 2, 3, 4) ---
          case 0: { // RIESIGER BONUS
            type = "good";
            titleGerman = "Singularitäts-Segen 🌌";
            if (sacrificeType === "life") {
              const reward = Math.floor(baseLps * 12000 * holeMultiplier);
              state.life += reward;
              state.totalLifeEarned += reward;
              textGerman = `Das Schwarze Loch spuckt einen gewaltigen Lebensschwarm aus! Du erhältst +${reward.toLocaleString("de-DE")} 💖 Leben!`;
            } else if (sacrificeType === "stars") {
              const reward = Math.floor(50 * holeMultiplier);
              state.starsCount += reward;
              textGerman = `Eine stellare Explosion schleudert Edelsteine heraus! Du erhältst +${reward} ⭐ Sterne!`;
            } else {
              const reward = Math.floor(40 * holeMultiplier);
              state.glitterDust += reward;
              textGerman = `Ein Regen aus reinem Kristallstaub bricht aus! Du erhältst +${reward} 💫 Kosmischen Glitzerstaub!`;
            }
            break;
          }
          case 1: { // SELTENES COSMETIC
            type = "good";
            titleGerman = "Kosmischer Fund 🎁";
            const allPossible = [
              "star_pink", "acc_flower_crown", "moon_sakura",
              "star_cyber", "acc_space_glasses", "moon_cyber",
              "star_gold", "acc_star_crown", "moon_gold",
              "star_ghostly", "frame_ghost", "moon_ghost",
              "star_butterfly", "acc_butterfly_wings", "frame_butterfly", "moon_butterfly"
            ];
            const locked = allPossible.filter(id => !state.unlockedCosmetics.includes(id));
            if (locked.length > 0) {
              const chosenCosmeticId = locked[Math.floor(Math.random() * locked.length)];
              state.unlockedCosmetics.push(chosenCosmeticId);
              textGerman = `Ein schwebendes Artefakt nähert sich aus der dunklen Zone! Du schaltetest ein seltenes Cosmetic frei: "${chosenCosmeticId.replace(/_/g, " ").toUpperCase()}"! 🎨`;
            } else {
              const fallbackDust = Math.floor(75 * holeMultiplier);
              state.glitterDust += fallbackDust;
              textGerman = `Da du bereits alle Kosmetika besitzt, erstrahlt der Fund in reinem Glitzerstaub! Du erhältst +${fallbackDust} 💫 Glitzerstaub!`;
            }
            break;
          }
          case 2: { // PRESTIGE-WÄHRUNG
            type = "good";
            titleGerman = "Quanten-Aufstieg 🎖️";
            state.prestigeCount = (state.prestigeCount || 0) + 1;
            textGerman = "Eine geheimnisvolle Hyperdimension faltet sich! Du erhältst +1 dauerhaftes Prestige-Level OHNE dein aktuelles Spiel zurückzusetzen!";
            break;
          }
          case 3: { // EVENT SOFORT STARTEN
            type = "good";
            titleGerman = "Akkretions-Ausbruch 💥";
            state.activeEvent = "supernova";
            state.activeEventDecision = "ignorieren";
            state.eventTimeRemaining = 180;
            textGerman = "Das Schwarze Loch destabilisiert sich und bricht in einer Supernova aus! Ein 180-sekündiges kosmisches Event hat sofort begonnen!";
            break;
          }
          case 4: { // SCHWARZES LOCH WIRD GRÖSSER & SPEICHERT BONUS
            type = "good";
            titleGerman = "Singularitäts-Wachstum 📈";
            state.blackHoleSize = (state.blackHoleSize || 1) + 1;
            textGerman = `Das Schwarze Loch verschlingt deine Opfergabe vollständig und dehnt seinen Ereignishorizont aus! Es wächst auf Stufe ${state.blackHoleSize}. Zukünftige gute Belohnungen steigen dauerhaft um +25%!`;
            break;
          }

          // --- BAD OUTCOMES (5, 6, 7, 8, 9) ---
          case 5: { // NICHTS PASSIERT
            type = "bad";
            titleGerman = "Ewiges Schweigen 🧘";
            textGerman = "Das Schwarze Loch absorbiert deine Opfergabe lautlos. Nichts passiert. Nur die eisige Kälte des ewigen Nichts vibriert im Raum...";
            break;
          }
          case 6: { // KATASTROPHALE VERLANGSAMUNG
            type = "bad";
            titleGerman = "Zeitdilatation ⏳";
            const starsLoss = Math.min(5, state.starsCount);
            state.starsCount -= starsLoss;
            const dustLoss = Math.min(10, state.glitterDust);
            state.glitterDust -= dustLoss;
            textGerman = `Eine massive Gravitationswelle verzerrt deine planetare Schwerkraft! Du verlierst zusätzlich ${starsLoss} Sterne und ${dustLoss} Glitzerstaub!`;
            break;
          }
          case 7: { // LEBENS-ABSORPTION
            type = "bad";
            titleGerman = "Materie-Verschlingung 🌀";
            const lifeLoss = Math.floor(state.life * 0.15);
            state.life -= lifeLoss;
            textGerman = `Der Gravitationsstrudel ergreift deinen Planeten! Er saugt zusätzlich ${lifeLoss.toLocaleString("de-DE")} 💖 Leben direkt aus deiner Planetenkruste!`;
            break;
          }
          case 8: { // STERNE-VERLUST
            type = "bad";
            titleGerman = "Sternen-Vakuum ✨";
            const sLoss = Math.min(8, state.starsCount);
            state.starsCount -= sLoss;
            textGerman = `Die unbarmherzige Anziehungskraft bricht Sterne aus ihrer Kreisbahn! ${sLoss} Sterne stürzen unaufhaltsam in den Abgrund der Singularität.`;
            break;
          }
          case 9: { // SCHWARZES LOCH SCHRUMPFT
            type = "bad";
            titleGerman = "Vakuum-Erosion 📉";
            const previousSize = state.blackHoleSize || 1;
            const newSize = Math.max(1, previousSize - 1);
            state.blackHoleSize = newSize;
            
            const lifeDrain = Math.floor(state.life * 0.05);
            state.life -= lifeDrain;
            
            if (previousSize > 1) {
              textGerman = `Das Schwarze Loch kollabiert unter seiner eigenen Last und schrumpft zurück auf Stufe ${newSize}! Du verlierst zudem ${lifeDrain.toLocaleString("de-DE")} 💖 Leben.`;
            } else {
              textGerman = `Das Schwarze Loch spuckt antimaterische Störstrahlung aus! Es kann nicht weiter schrumpfen, aber du verlierst zusätzliche ${lifeDrain.toLocaleString("de-DE")} 💖 Leben.`;
            }
            break;
          }
        }

        postMessage({
          type: "BLACK_HOLE_GAMBLE_RESULT",
          success: true,
          roll,
          outcomeType: type,
          title: titleGerman,
          text: textGerman,
        });

        broadcastStateUpdate(true);
      } else {
        postMessage({
          type: "BLACK_HOLE_GAMBLE_RESULT",
          success: false,
          error: "Nicht genügend Ressourcen für diese Opfergabe!",
        });
      }
      break;
    }
    case "CLEANUP": {
      stopTimers();
      break;
    }
    default:
      break;
  }
});
