import { defineConfig, type RolldownOptions } from "rolldown";
import { globSync } from "fs";

const input: RolldownOptions["input"] =
    process.env.TEST === "true" ? globSync("tests/**/*") : ["src/extension.ts"];

const output: RolldownOptions["output"] = {
    sourcemap: true,
    format: "cjs",
    banner: `"use strict";\n`,
    minify: process.env.DEV !== "true",
    cleanDir: true,
};

if (process.env.TEST === "true") {
    output.dir = "out_test";
    output.preserveModules = true;
    output.preserveModulesRoot = "tests";
} else {
    output.file = "out/extension.js";
}

export default defineConfig({
    input,
    output,
    external: ["vscode"],
    platform: "node",
    transform: {
        target: "node16",
    },
});
