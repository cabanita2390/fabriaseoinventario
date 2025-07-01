// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true, // ← aquí
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: [
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/*.(spec|test).ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
};
