module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '@gouvfr-anct/(.*)': '<rootDir>/dist/@gouvfr-anct/$1'
  }
};
