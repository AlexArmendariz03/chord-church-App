import nextJest from "next/jest"

const createJestConfig = nextJest({
  dir: "./"
})

const config = {
  clearMocks: true,
  collectCoverageFrom: ["src/lib/validation/**/*.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"]
}

export default createJestConfig(config)
