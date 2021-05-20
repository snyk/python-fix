module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {}, // ignore .babelrc file
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  collectCoverageFrom: ['lib/**/*.ts'],
  coverageReporters: ['text-summary', 'html'],
  testMatch: ['**/test/**/*.spec.ts'],
};
