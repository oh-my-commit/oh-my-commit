// File change status colors
import { FileStatus } from "@/types/file-change";

export const STATUS_COLORS: Record<FileStatus, string> = {
  added: "text-git-added-fg", // Git decoration colors
  modified: "text-git-modified-fg",
  deleted: "text-git-deleted-fg",
  renamed: "text-git-renamed-fg",
  default: "text-git-modified-fg",
} as const;

// File change status letters (Git-style)
export const STATUS_LETTERS: Record<FileStatus, string> = {
  added: "A",
  modified: "M",
  deleted: "D",
  renamed: "R",
  default: "?",
} as const;

// File change status labels (for tooltips)
export const STATUS_LABELS: Record<FileStatus, string> = {
  added: "Added",
  modified: "Modified",
  deleted: "Deleted",
  renamed: "Renamed",
  default: "Unknown",
} as const;

// View modes
export const VIEW_MODES = {
  flat: "Flat",
  grouped: "Group",
  tree: "Tree",
} as const;
