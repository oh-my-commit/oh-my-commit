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

const vsMap = Object.fromEntries(
  vsVariables.map((key) => [key, `var(--${key})`])
);

// Plugin configuration
export const vsTheme = {
  theme: {
    extend: {
      colors: vsMap,
      backgroundColor: vsMap,
      textColor: vsMap,
      borderColor: vsMap,
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: Function }) {
      const utilities = {
        // Background with opacity variants
      };
      addUtilities(utilities);
    },
  ],
};
