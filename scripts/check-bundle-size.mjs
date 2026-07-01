#!/usr/bin/env node
/**
 * CI gate: fail when the initial JS payload regresses.
 *
 * Entry = the single index-*.js chunk. Initial = entry plus the eagerly
 * loaded firebase/motion chunks (everything a fresh visit downloads before
 * interaction; lazy modal chunks are excluded).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const ENTRY_BUDGET_KB = 250;
const INITIAL_BUDGET_KB = 400;

const dir = "dist/assets";
const files = readdirSync(dir).filter((f) => f.endsWith(".js"));

const gz = (file) => gzipSync(readFileSync(join(dir, file))).length / 1024;

const entry = files.filter((f) => /^index-/.test(f));
const eager = files.filter((f) => /^(firebase|motion)-/.test(f));

const entryKb = entry.reduce((sum, f) => sum + gz(f), 0);
const initialKb = entryKb + eager.reduce((sum, f) => sum + gz(f), 0);

console.log(`entry JS (gzip): ${entryKb.toFixed(1)} kB (budget ${ENTRY_BUDGET_KB} kB)`);
console.log(`initial JS (gzip): ${initialKb.toFixed(1)} kB (budget ${INITIAL_BUDGET_KB} kB)`);

if (entryKb > ENTRY_BUDGET_KB || initialKb > INITIAL_BUDGET_KB) {
  console.error("Bundle budget exceeded.");
  process.exit(1);
}
