#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_commander = require("commander");
var import_chalk = __toESM(require("chalk"), 1);
var import_scanner = require("./scanner.js");
var import_output = require("./output.js");
var import_fs = require("fs");
var import_path = require("path");
var import_url = require("url");
const import_meta = {};
const __dirname = (0, import_path.dirname)((0, import_url.fileURLToPath)(import_meta.url));
const packageJson = JSON.parse((0, import_fs.readFileSync)((0, import_path.join)(__dirname, "..", "package.json"), "utf-8"));
const program = new import_commander.Command();
program.name("npm-guard").version(packageJson.version).description("Unified dependency health and supply-chain risk scanner for npm projects").option("--json", "Output results as JSON").option("--fail-under <score>", "Exit with error if score is below threshold", parseInt).option("--verbose", "Show detailed output").action(async (options) => {
  try {
    const result = await (0, import_scanner.scan)(process.cwd());
    if (options.json) {
      (0, import_output.printJson)(result);
    } else {
      (0, import_output.printPretty)(result);
    }
    if (options.failUnder && result.totalScore < options.failUnder) {
      console.error(import_chalk.default.red(`
\u2717 Health score ${result.totalScore} is below threshold ${options.failUnder}`));
      process.exit(1);
    }
    if (result.totalScore < 50) {
      process.exit(1);
    }
  } catch (error) {
    console.error(import_chalk.default.red("Error:"), error);
    process.exit(1);
  }
});
program.parse();
