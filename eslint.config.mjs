import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import securityPlugin from 'eslint-plugin-security';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = tseslint.config(
  ...compat.extends('next/core-web-vitals'),
  {
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // 型定義に interface を強制する
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ], // インポート時に type を強制する
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }], // Promise の誤った使用を警告する。ただし、void 型を想定している場合に、Promise を使用してもエラーにしない
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 未使用の変数、関数、パラメータの使用を警告する。ただし、_ から始まる変数は許容する
    },
  },
  {
    extends: [unicornPlugin.configs.recommended],
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            kebabCase: true,
          },
        },
      ],
      'unicorn/prevent-abbreviations': 'off', // 短縮表記を許容する
    },
  },
  {
    extends: [perfectionist.configs['recommended-natural']],
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          groups: [
            ['builtin', 'external', 'internal'], // recommended-natural と同じ
            ['parent', 'sibling', 'index'], // recommended-natural と同じ
          ],
          newlinesBetween: 'never', // 改行をしないようここだけ変更
          type: 'natural', // recommended-natural と同じ
        },
      ],
    },
  },
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // 未使用のインポート、未使用の変数を許容しない。ただし、_ から始まる変数は許容する
      '@typescript-eslint/no-unused-vars': 'off',
      'unicorn/import-style': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    extends: [securityPlugin.configs.recommended],
  },
  {
    rules: {
      'prefer-template': 'error', // テンプレートリテラルを利用を強制
    },
  },
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
  {
    ignores: ['**/.next/**', '**/node_modules/**'],
  }
);

export default eslintConfig;
