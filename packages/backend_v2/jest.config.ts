// jest.config.ts
import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.e2e.test.ts"],
    testTimeout: 120000,

    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            { tsconfig: "tsconfig.jest.json", useESM: true }
        ]
    },

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^src/(.*)$": "<rootDir>/src/$1",

        // 🔧 ESM pain points → CJS stubs
    },

    moduleFileExtensions: ["ts", "tsx", "js", "mjs", "cjs", "json", "node"],
};

export default config;
