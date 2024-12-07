/**
 * VSCode Theme Integration for Tailwind CSS
 *
 * Converts VSCode theme variables into Tailwind-compatible color values
 * with support for opacity modifiers.
 */

import {
  createTailwindThemePlugin,
  type ThemePluginConfig,
} from "./tailwind-theme-plugin";

// VSCode theme specific configuration
const vscodeThemeConfig: ThemePluginConfig = {
  inputs: [
    // Editor
    "editor-background",
    "editor-foreground",
    "editor-lineHighlightBackground",
    "editorLineNumber-foreground",

    // Git
    "diffEditor-insertedTextBackground",
    "diffEditor-removedTextBackground",
    "gitDecoration-addedResourceBackground",
    "gitDecoration-addedResourceForeground",
    "gitDecoration-conflictingResourceBackground",
    "gitDecoration-conflictingResourceForeground",
    "gitDecoration-deletedResourceBackground",
    "gitDecoration-deletedResourceForeground",
    "gitDecoration-ignoredResourceBackground",
    "gitDecoration-ignoredResourceForeground",
    "gitDecoration-modifiedResourceBackground",
    "gitDecoration-modifiedResourceForeground",
    "gitDecoration-renamedResourceBackground",
    "gitDecoration-renamedResourceForeground",
    "gitDecoration-stageDeletedResourceBackground",
    "gitDecoration-stageDeletedResourceForeground",
    "gitDecoration-stageModifiedResourceBackground",
    "gitDecoration-stageModifiedResourceForeground",
    "gitDecoration-submoduleResourceBackground",
    "gitDecoration-submoduleResourceForeground",
    "gitDecoration-unstagedResourceBackground",
    "gitDecoration-unstagedResourceDecorationBackground",
    "gitDecoration-unstagedResourceDecorationForeground",
    "gitDecoration-unstagedResourceForeground",
    "gitDecoration-untrackedResourceBackground",
    "gitDecoration-untrackedResourceForeground",

    // Input
    "input-background",
    "input-foreground",
    "input-placeholderForeground",
    "inputOption-activeForeground",

    // UI
    "list-activeSelectionBackground",
    "list-activeSelectionForeground",
    "list-hoverBackground",
    "panel-border",
    "sideBar-background",
    "sideBarTitle-foreground",
  ],
  transform: {
    input2field: (name) => `vscode-${name}`,
    input2value: (name) =>
      `rgb(from var(--vscode-${name}) r g b / <alpha-value>)`,
  },
};

// Create and export the VSCode theme plugin
export default createTailwindThemePlugin(vscodeThemeConfig);
