/**
 * 本文件是 tailwind 插件，用于将 vscode 预设的 hex 形式的 css 变量转换为 tailwind 变量，并支持透明度。
 * 感谢 claude 2024年12月08日03:20:44 （耗时 2 小时，终于解决了历史遗留问题：关于 hex 透明度的注入）：
 * @see: [Tailwind CSS Plugin for Hex Color Opacity - Claude](https://claude.ai/chat/2e0544d8-eda0-4b88-afa3-ac0b57ebbd2f)
 *
 * 输入： --vscode-diffEditor-insertedTextBackground hex
 * 输出：
 *   - text-vscode-diffEditor-insertedTextBackground √
 *   - bg-vscode-diffEditor-insertedTextBackground √
 *   - bg-vscode-diffEditor-insertedTextBackground/50 √
 *
 */

import plugin from "tailwindcss/plugin";

// 定义 VSCode 变量数组
const vsVariables = [
  "vscode-diffEditor-insertedTextBackground",
  "vscode-diffEditor-removedTextBackground",
  "vscode-editor-background",
  "vscode-editor-foreground",
  "vscode-editor-lineHighlightBackground",
  "vscode-editorLineNumber-foreground",
  "vscode-gitDecoration-addedResourceBackground",
  "vscode-gitDecoration-addedResourceForeground",
  "vscode-gitDecoration-conflictingResourceBackground",
  "vscode-gitDecoration-conflictingResourceForeground",
  "vscode-gitDecoration-deletedResourceBackground",
  "vscode-gitDecoration-deletedResourceForeground",
  "vscode-gitDecoration-ignoredResourceBackground",
  "vscode-gitDecoration-ignoredResourceForeground",
  "vscode-gitDecoration-modifiedResourceBackground",
  "vscode-gitDecoration-modifiedResourceForeground",
  "vscode-gitDecoration-renamedResourceBackground",
  "vscode-gitDecoration-renamedResourceForeground",
  "vscode-gitDecoration-stageDeletedResourceBackground",
  "vscode-gitDecoration-stageDeletedResourceForeground",
  "vscode-gitDecoration-stageModifiedResourceBackground",
  "vscode-gitDecoration-stageModifiedResourceForeground",
  "vscode-gitDecoration-submoduleResourceBackground",
  "vscode-gitDecoration-submoduleResourceForeground",
  "vscode-gitDecoration-unstagedResourceBackground",
  "vscode-gitDecoration-unstagedResourceDecorationBackground",
  "vscode-gitDecoration-unstagedResourceDecorationForeground",
  "vscode-gitDecoration-unstagedResourceForeground",
  "vscode-gitDecoration-untrackedResourceBackground",
  "vscode-gitDecoration-untrackedResourceForeground",
  "vscode-input-background",
  "vscode-input-foreground",
  "vscode-input-placeholderForeground",
  "vscode-inputOption-activeForeground",
  "vscode-list-activeSelectionBackground",
  "vscode-list-activeSelectionForeground",
  "vscode-list-hoverBackground",
  "vscode-panel-border",
  "vscode-sideBar-background",
  "vscode-sideBarTitle-foreground",
];

// 创建插件
export default plugin(
  function () {
    // 不需要在这里添加基础样式，因为 VSCode 已经提供了 hex 变量
  },
  {
    theme: {
      extend: {
        colors: vsVariables.reduce((acc, varName) => {
          // 直接使用 CSS var() 函数获取 hex 值，然后通过 color-mix 转换为 RGB
          acc[varName] = `rgb(from var(--${varName}) r g b / <alpha-value>)`;
          return acc;
        }, {} as Record<string, string>),
      },
    },
  }
);
