module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always", // 确保箭头函数使用括号
  endOfLine: "lf",
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "^reflect-metadata$",
    "^react.*(/.*)?$",
    "^@vscode/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "@oh-my-commit/(.*)$",
    "^@shared/(.*)$",
    "@cli/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
}
