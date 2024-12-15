interface CommitType {
  value: string;
  label: string;
  description: string;
}

// 最常用的提交类型
export const COMMON_COMMIT_TYPES: CommitType[] = [
  {
    value: "feat",
    label: "✨ Feature",
    description: "Add or update features",
  },
  {
    value: "fix",
    label: "🐛 Fix",
    description: "Fix a bug or issue",
  },
  {
    value: "refactor",
    label: "♻️ Refactor",
    description: "Refactor code without changing functionality",
  },
  {
    value: "style",
    label: "💄 Style",
    description: "Improve structure/format of the code",
  },
  {
    value: "docs",
    label: "📚 Docs",
    description: "Add or update documentation",
  },
];

// 扩展的提交类型
export const EXTENDED_COMMIT_TYPES: CommitType[] = [
  {
    value: "perf",
    label: "⚡️ Performance",
    description: "Improve performance",
  },
  {
    value: "test",
    label: "✅ Test",
    description: "Add or update tests",
  },
  {
    value: "build",
    label: "📦 Build",
    description: "Changes that affect the build system or dependencies",
  },
  {
    value: "ci",
    label: "👷 CI",
    description: "Changes to CI configuration files and scripts",
  },
  {
    value: "chore",
    label: "🔧 Chore",
    description: "Other changes that don't modify src or test files",
  },
  {
    value: "revert",
    label: "⏪ Revert",
    description: "Revert a previous commit",
  },
  {
    value: "wip",
    label: "🚧 WIP",
    description: "Work in progress",
  },
  {
    value: "ui",
    label: "🎨 UI",
    description: "Update user interface and style files",
  },
  {
    value: "security",
    label: "🔒 Security",
    description: "Fix security issues",
  },
  {
    value: "config",
    label: "⚙️ Config",
    description: "Change configuration files",
  },
];
