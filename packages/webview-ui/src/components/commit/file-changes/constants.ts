// File change status colors

import { GitFileStatus } from "@yaac/shared";

export const STATUS_COLORS: Record<GitFileStatus, string> = {
  untracked: "text-git-added-fg",
  modified: "text-git-modified-fg",
  deleted: "text-git-deleted-fg",
  renamed: "text-git-renamed-fg",
  copied: "text-git-copied-fg",
  unmerged: "text-git-unmerged-fg",
} as const;

// File change status letters (Git-style)
export const STATUS_LETTERS: Record<GitFileStatus, string> = {
  untracked: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
  copied: "C",
  unmerged: "U",
} as const;

// File change status labels (for tooltips)
export const STATUS_LABELS: Record<GitFileStatus, string> = {
  untracked: "Untracked",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
  copied: "Copied",
  unmerged: "Unmerged",
} as const;

// View modes
export const VIEW_MODES = {
  FLAT: "flat",
  GROUPED: "grouped",
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];
