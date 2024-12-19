/**
 * VSCode Theme Integration for Tailwind CSS
 *
 * Converts VSCode theme variables into Tailwind-compatible color values
 * with support for opacity modifiers.
 */
/**
 * VSCode theme variable mapping
 * Format: 'tailwind-class-name': 'vscode-variable-name'
 */
declare const VSCODE_THEME_MAPPING: {
    readonly "editor-bg": "editor-background";
    readonly "editor-fg": "editor-foreground";
    readonly "editor-line-highlight": "editor-lineHighlightBackground";
    readonly "editor-line-number": "editorLineNumber-foreground";
    readonly "input-bg": "input-background";
    readonly "input-fg": "input-foreground";
    readonly "input-border": "input-border";
    readonly "input-focus-border": "focusBorder";
    readonly "input-placeholder": "input-placeholderForeground";
    readonly "input-active": "inputOption-activeForeground";
    readonly "list-hover-bg": "list-hoverBackground";
    readonly "list-active-bg": "list-activeSelectionBackground";
    readonly "list-active-fg": "list-activeSelectionForeground";
    readonly "list-inactive-bg": "list-inactiveSelectionBackground";
    readonly "list-inactive-fg": "list-inactiveSelectionForeground";
    readonly "git-inserted": "diffEditor-insertedTextBackground";
    readonly "git-removed": "diffEditor-removedTextBackground";
    readonly "git-added": "gitDecoration-addedResourceBackground";
    readonly "git-added-fg": "gitDecoration-addedResourceForeground";
    readonly "git-modified": "gitDecoration-modifiedResourceBackground";
    readonly "git-modified-fg": "gitDecoration-modifiedResourceForeground";
    readonly "git-deleted": "gitDecoration-deletedResourceBackground";
    readonly "git-deleted-fg": "gitDecoration-deletedResourceForeground";
    readonly "git-renamed": "gitDecoration-renamedResourceBackground";
    readonly "git-renamed-fg": "gitDecoration-renamedResourceForeground";
    readonly "git-conflict": "gitDecoration-conflictingResourceBackground";
    readonly "git-conflict-fg": "gitDecoration-conflictingResourceForeground";
    readonly "git-ignored": "gitDecoration-ignoredResourceBackground";
    readonly "git-ignored-fg": "gitDecoration-ignoredResourceForeground";
    readonly "git-staged-deleted": "gitDecoration-stageDeletedResourceBackground";
    readonly "git-staged-deleted-fg": "gitDecoration-stageDeletedResourceForeground";
    readonly "git-staged-modified": "gitDecoration-stageModifiedResourceBackground";
    readonly "git-staged-modified-fg": "gitDecoration-stageModifiedResourceForeground";
    readonly "git-submodule": "gitDecoration-submoduleResourceBackground";
    readonly "git-submodule-fg": "gitDecoration-submoduleResourceForeground";
    readonly "git-unstaged": "gitDecoration-unstagedResourceBackground";
    readonly "git-unstaged-fg": "gitDecoration-unstagedResourceForeground";
    readonly "git-unstaged-decor": "gitDecoration-unstagedResourceDecorationBackground";
    readonly "git-unstaged-decor-fg": "gitDecoration-unstagedResourceDecorationForeground";
    readonly "git-untracked": "gitDecoration-untrackedResourceBackground";
    readonly "git-untracked-fg": "gitDecoration-untrackedResourceForeground";
    readonly "panel-border": "panel-border";
    readonly "sidebar-bg": "sideBar-background";
    readonly "sidebar-title": "sideBarTitle-foreground";
    readonly "description-fg": "descriptionForeground";
};
declare const _default: {
    handler: import("tailwindcss/types/config").PluginCreator;
    config?: Partial<import("tailwindcss/types/config").Config>;
};
export default _default;
export { VSCODE_THEME_MAPPING };
