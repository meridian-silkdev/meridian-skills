#!/usr/bin/env node
// Runs on `npm version` (via the "version" lifecycle script) so
// .claude-plugin/plugin.json's version can never drift from package.json's —
// the publish workflow's tag-vs-version check depends on both matching.
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const pluginPath = ".claude-plugin/plugin.json";
const plugin = JSON.parse(readFileSync(pluginPath, "utf8"));

plugin.version = pkg.version;
writeFileSync(pluginPath, JSON.stringify(plugin, null, 2) + "\n");

console.log(`Synced ${pluginPath} version -> ${pkg.version}`);
