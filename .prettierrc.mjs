/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
const config = {
  bracketSpacing: true,
  jsxBracketSameLine: false,
  printWidth: 100,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  rangeEnd: Infinity,
  rangeStart: 0,
  importOrder: [
    "<TYPES>^(node:)",
    "<TYPES>",
    "^react.*",
    "^next$",
    "^next/.*$",
    "^@mbao01/(.*)$",
    "<BUILTIN_MODULES>",
    "<THIRD_PARTY_MODULES>",
    "<TYPES>^[.]",
    "^[.]",
  ],
};

export default config;
