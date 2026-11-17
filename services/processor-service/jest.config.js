module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.spec.ts"],
  collectCoverageFrom: ["src/useCases/**/*.ts"],
  coverageThreshold: {
    global: { statements: 70, branches: 50, functions: 70, lines: 70 }
  }
};
