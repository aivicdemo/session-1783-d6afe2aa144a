/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/tests/unit/itg-5-*.test.ts","**/tests/unit/itg-5-*.test.js"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testEnvironment: "node",
};
