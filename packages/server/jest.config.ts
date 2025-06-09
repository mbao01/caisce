import type { Config } from "jest";

const config: Config = {
  rootDir: __dirname, // This points Jest to packages/server
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s", "!src/main.ts"],
  coverageDirectory: "coverage",
  testEnvironment: "node",
};

export default config;
