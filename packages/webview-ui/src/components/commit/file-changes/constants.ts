// File change status colors

import { GitChangeType } from "@oh-my-commit/shared";

export const STATUS_COLORS: Record<GitChangeType, string> = {
  added: "text-git-added-fg",
  modified: "text-git-modified-fg",
  deleted: "text-git-deleted-fg",
  renamed: "text-git-renamed-fg",
  copied: "text-git-copied-fg",
  unmerged: "text-git-unmerged-fg",
  unknown: "text-git-unknown-fg",
} as const;

// File change status letters (Git-style)
export const STATUS_LETTERS: Record<GitChangeType, string> = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
  copied: "C",
  unmerged: "U",
  unknown: "?",
} as const;

// File change status labels (for tooltips)
export const STATUS_LABELS: Record<GitChangeType, string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
  copied: "Copied",
  unmerged: "Unmerged",
  unknown: "Unknown",
} as const;

// View modes
export type ViewMode = "flat" | "tree";
