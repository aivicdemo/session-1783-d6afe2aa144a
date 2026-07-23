/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/tests/unit/itg-3-*.test.ts","**/tests/unit/itg-3-*.test.js"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testEnvironment: "node",
};
