module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.spec.ts"],
  collectCoverageFrom: [
    "src/useCases/**/*.ts",
    "src/middlewares/**/*.ts"
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 60, functions: 80, lines: 80 }
  }
};
