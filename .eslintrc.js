/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const moment = require("moment")

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    // 不要打开它，我们做了配置解析
    // project: ["./packages/*/tsconfig.json"], // 支持从每个包中解析 tsconfig
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "prettier", // 确保在最后
  ],
  plugins: ["import", "prettier", "header"],
  settings: {
    "import/resolver": {
      typescript: {
        project: ["./packages/*/tsconfig.json"],
        alwaysTryTypes: true,
      },
    },
  },
  // 基础规则，适用于所有包
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "prettier/prettier": "error",
    "no-unused-vars": "warn",

    "header/header": [
      2,
      "block",
      [
        "*",
        " * @Copyright Copyright (c) 2024 Oh My Commit",
        " * @Author markshawn2020",
        {
          pattern: ` \\* @CreatedAt \\d{4}-\\d{2}-\\d{2}`,
          template: ` * @CreatedAt ${moment(new Date()).format("YYYY-MM-DD")}`,
        },
        " *",
        " * This source code is licensed under the MIT license found in the",
        " * LICENSE file in the root directory of this source tree.",
        " ",
      ],
      1,
    ],
  },

  overrides: [
    {
      files: ["./packages/shared/src/server/prompt-loader.ts"],
      parserOptions: {
        project: ["./packages/shared/tsconfig.json"],
      },
    },

    // TypeScript 文件使用严格的 TS 规则
    {
      files: ["packages/*/src/**/*.{ts,tsx}"],
      excludedFiles: ["**/dist/**", "**/build/**"], // 明确排除构建目录
      parserOptions: {
        project: ["./packages/*/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
        "@typescript-eslint/no-base-to-string": "warn",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/no-var-requires": "warn",
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/await-thenable": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/click-events-have-key-events": "warn",
      },
    },

    // shared 库特定规则
    {
      files: ["packages/shared/**/*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "no-console": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
      },
    },

    // extension 包（VSCode 插件）特定规则
    {
      files: ["packages/extension/**/*.{ts,tsx}"],
      env: {
        node: true,
        worker: true, // VSCode 扩展可能运行在 webworker 环境
      },
      globals: {
        vscode: "readonly", // VSCode API 全局变量
      },
      rules: {
        "no-restricted-globals": "off", // VSCode 扩展需要访问特定全局变量
        "@typescript-eslint/no-namespace": "off", // 允许使用命名空间
        "no-console": "off", // 允许使用控制台输出用于调试
      },
    },

    // cli 包特定规则
    {
      files: ["packages/cli/**/*.{ts,js}"],
      env: {
        node: true,
      },
      rules: {
        "no-console": "off", // CLI 工具需要控制台输出
        "no-process-exit": "off", // 允许使用 process.exit()
        "@typescript-eslint/no-var-requires": "off", // 允许使用 require
        "global-require": "off", // 允许使用 require
      },
    },
    // web 项目特定规则
    {
      files: ["packages/webview/**/*.{ts,tsx,js,jsx}"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      plugins: ["react", "react-hooks", "jsx-a11y"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/click-events-have-key-events": "warn",
        "jsx-a11y/label-has-associated-control": "warn",
      },
      settings: {
        react: {
          version: "detect",
        },
      },
    },

    // 配置文件的规则
    {
      files: [
        "**/*.config.{js,ts}",
        "**/*.setup.{js,ts}",
        ".eslintrc.js",
        "jest.config.ts",
        "vitest.config.ts",
        "turbo.json",
      ],
      env: {
        node: true,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "import/no-default-export": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
  ],

  ignorePatterns: [
    "dist",
    "build",
    "node_modules",
    "*.d.ts",
    "*.config.js",
    "*.tsbuildinfo",
    "*.json",
    ".eslintrc.js",
    ".prettierc.js",
  ],
}
