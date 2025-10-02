#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { scan } from "./scanner.js";
import { printPretty, printJson } from "./output.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const program = new Command();
program
    .name("npm-guard")
    .version(packageJson.version)
    .description("Unified dependency health and supply-chain risk scanner for npm projects")
    .option("--json", "Output results as JSON")
    .option("--fail-under <score>", "Exit with error if score is below threshold", parseInt)
    .option("--verbose", "Show detailed output")
    .action(async (options) => {
    try {
        const result = await scan(process.cwd());
        if (options.json) {
            printJson(result);
        }
        else {
            printPretty(result);
        }
        if (options.failUnder && result.totalScore < options.failUnder) {
            console.error(chalk.red(`\n✗ Health score ${result.totalScore} is below threshold ${options.failUnder}`));
            process.exit(1);
        }
        if (result.totalScore < 50) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk.red("Error:"), error);
        process.exit(1);
    }
});
program.parse();
