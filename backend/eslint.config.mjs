import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        // Base ESLint config
        ...eslint.configs.recommended,
    },
    // TypeScript configs
    ...tseslint.configs.recommended,
    {
        // TypeScript-specific settings
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: '.',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        // Add rules inside this object
        rules: {
            "no-console": "warn",
            "dot-notation": "error", // Fixed the typo from "dot-botation" to "dot-notation"
            "no-misused-promises": "off"
        },
    },
    {
        // Ignore patterns
        ignores: [
            'dist/**',
            'node_modules/**',
            'eslint.config.js', // Ignore the ESLint config file itself
        ],
    }
);