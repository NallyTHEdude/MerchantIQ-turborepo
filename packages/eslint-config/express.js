import globals from 'globals';
import { config as baseConfig } from './base.js';

/**
 * A shared ESLint configuration for Express/server packages.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const expressConfig = [
    ...baseConfig,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
];

export default expressConfig;
