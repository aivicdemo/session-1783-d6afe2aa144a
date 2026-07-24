/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/tests/unit/itg-6-*.test.ts","**/tests/unit/itg-6-*.test.js"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testEnvironment: "node",
};
