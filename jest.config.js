/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["**/tests/unit/common-*.test.ts","**/tests/unit/common-*.test.js"],
  transform: { "^.+\\.tsx?$": "ts-jest" },
  testEnvironment: "node",
};
