// jest.config.js
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true
        }],
    },
    // collectCoverage: true,
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    testMatch: ['**/tests/**/*.test.ts'],
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};