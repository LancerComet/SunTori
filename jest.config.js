module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: '<rootDir>/.coverage-report',
  moduleNameMapper: {
    '../lib$': '<rootDir>/dist/index.js'
  },
  collectCoverageFrom: [
    '<rootDir>/dist/index.js',
    '!**/*.d.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**'
  ]
}
