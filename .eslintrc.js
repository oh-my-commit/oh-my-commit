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
  ignorePatterns: ["*.config.*", "dist", "node_modules"],
  plugins: ["header"],

  overrides: [
    // TypeScript 文件配置
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: [
        "@cs-magic/eslint-config/typescript",
        "@cs-magic/eslint-config/react",
        "@cs-magic/eslint-config/prettier",
      ],
      parserOptions: {
        project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      settings: {
        "import/resolver": {
          typescript: {
            project: ["packages/__base__/tsconfig.json", "packages/*/tsconfig.json"],
            alwaysTryTypes: true,
          },
        },
      },
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
          },
        ],
        "@typescript-eslint/no-misused-promises": [
          "error",
          {
            checksVoidReturn: false,
          },
        ],
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
        // 放宽未使用变量的规则
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
        "no-unused-vars": "off", // 关闭基础规则，使用 @typescript-eslint 的规则
        // 允许 any
        "@typescript-eslint/no-explicit-any": "off",
        // 允许不安全的操作
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
    // JavaScript 文件配置
    {
      files: ["**/*.js", "**/*.jsx"],
      extends: [
        "eslint:recommended",
        "@cs-magic/eslint-config/react",
        "@cs-magic/eslint-config/prettier",
      ],
      rules: {
        // 放宽未使用变量的规则
        "no-unused-vars": [
          "warn",
          {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
      },
    },
    // WebView 特殊配置
    {
      files: ["packages/webview/**"],
      globals: {
        acquireVsCodeApi: "readonly",
      },
    },
  ],

  // 通用配置
  env: {
    browser: true,
    commonjs: true,
    node: true,
    jest: true,
  },
  globals: {
    JSX: true,
  },
  rules: {
    "header/header": [
      2,
      "block",
      [
        "*",
        " * @Copyright Copyright (c) 2024 Oh My Commit",
        " * @Author markshawn2020",
        ` * @CreatedAt ${moment(new Date()).format("YYYY-MM-DD")}`,
        " *",
        " * This source code is licensed under the MIT license found in the",
        " * LICENSE file in the root directory of this source tree.",
        " ",
      ],
      2,
    ],
  },
}
