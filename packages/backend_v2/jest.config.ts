import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.e2e.test.ts"],
    testTimeout: 120000,

    // ESM + TS
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.jest.json",
                useESM: true,
                isolatedModules: true
            }
        ]
    },

    // Always provide an object (satisfies exactOptionalPropertyTypes)
    moduleNameMapper: {
        // strip .js extension that TS adds in ESM output when importing relative modules
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^src/(.*)$": "<rootDir>/src/$1"
    },

    moduleFileExtensions: ["ts", "tsx", "js", "mjs", "cjs", "json", "node"]
};

export default config;
