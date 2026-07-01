/**
 * Facade over the adaptive audio engine in src/audio — every historical
 * import path and export keeps working. Still zero audio assets: all sound
 * is Web Audio synthesis (see src/audio/engine.ts for the bus graph).
 */
export * from "../audio";
