// File Path: server/jest.config.ts

import type {Config} from '@jest/types';

const config:Config.InitialOptions= {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    coverageDirectory: 'coverage',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/tests/**/*.test.ts'],
};

export default config;