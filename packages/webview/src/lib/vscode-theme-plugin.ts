/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createTailwindThemePlugin, type ThemePluginConfig } from "./tailwind-theme-plugin"

// Helper function to create VSCode color value
const createVSCodeColor = (name: string) => `rgb(from var(--vscode-${name}) r g b / <alpha-value>)`

/**
 * VSCode theme variable mapping
 * Format: 'tailwind-class-name': 'vscode-variable-name'
 */
const VSCODE_THEME_MAPPING = {
  // Editor
  "editor-bg": "editor-background",
  "editor-fg": "editor-foreground",
  "editor-line-highlight": "editor-lineHighlightBackground",
  "editor-line-number": "editorLineNumber-foreground",

  // Input Controls
  "input-bg": "input-background",
  "input-fg": "input-foreground",
  "input-border": "input-border",
  "input-focus-border": "focusBorder",
  "input-placeholder": "input-placeholderForeground",
  "input-active": "inputOption-activeForeground",

  // Lists & Trees
  "list-hover-bg": "list-hoverBackground",
  "list-active-bg": "list-activeSelectionBackground",
  "list-active-fg": "list-activeSelectionForeground",
  "list-inactive-bg": "list-inactiveSelectionBackground",
  "list-inactive-fg": "list-inactiveSelectionForeground",

  // Git Decorations
  "git-inserted": "diffEditor-insertedTextBackground",
  "git-removed": "diffEditor-removedTextBackground",
  "git-added": "gitDecoration-addedResourceBackground",
  "git-added-fg": "gitDecoration-addedResourceForeground",
  "git-modified": "gitDecoration-modifiedResourceBackground",
  "git-modified-fg": "gitDecoration-modifiedResourceForeground",
  "git-deleted": "gitDecoration-deletedResourceBackground",
  "git-deleted-fg": "gitDecoration-deletedResourceForeground",
  "git-renamed": "gitDecoration-renamedResourceBackground",
  "git-renamed-fg": "gitDecoration-renamedResourceForeground",
  "git-conflict": "gitDecoration-conflictingResourceBackground",
  "git-conflict-fg": "gitDecoration-conflictingResourceForeground",
  "git-ignored": "gitDecoration-ignoredResourceBackground",
  "git-ignored-fg": "gitDecoration-ignoredResourceForeground",
  "git-staged-deleted": "gitDecoration-stageDeletedResourceBackground",
  "git-staged-deleted-fg": "gitDecoration-stageDeletedResourceForeground",
  "git-staged-modified": "gitDecoration-stageModifiedResourceBackground",
  "git-staged-modified-fg": "gitDecoration-stageModifiedResourceForeground",
  "git-submodule": "gitDecoration-submoduleResourceBackground",
  "git-submodule-fg": "gitDecoration-submoduleResourceForeground",
  "git-unstaged": "gitDecoration-unstagedResourceBackground",
  "git-unstaged-fg": "gitDecoration-unstagedResourceForeground",
  "git-unstaged-decor": "gitDecoration-unstagedResourceDecorationBackground",
  "git-unstaged-decor-fg": "gitDecoration-unstagedResourceDecorationForeground",
  "git-untracked": "gitDecoration-untrackedResourceBackground",
  "git-untracked-fg": "gitDecoration-untrackedResourceForeground",

  // UI Elements
  "panel-border": "panel-border",
  "sidebar-bg": "sideBar-background",
  "sidebar-title": "sideBarTitle-foreground",
  "description-fg": "descriptionForeground",
} as const

// VSCode theme specific configuration
const vscodeThemeConfig: ThemePluginConfig = {
  mapping: Object.entries(VSCODE_THEME_MAPPING).reduce(
    (acc, [key, value]) => {
      acc[key] = createVSCodeColor(value)
      return acc
    },
    {} as Record<string, string>,
  ),
}

// Create and export the VSCode theme plugin
export default createTailwindThemePlugin(vscodeThemeConfig)

// Export mapping for reference
export { VSCODE_THEME_MAPPING }
