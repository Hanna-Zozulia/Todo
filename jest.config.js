/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  extensionsToTreatAsEsm: ['.ts'],

  testMatch: ['<rootDir>/tests/**/*.test.ts'],
};




