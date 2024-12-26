/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { GitChangeType } from "@shared/common"

import type { FileChange } from "../state/types"

export const mockFileChanges: FileChange[] = [
  {
    path: "src/components/App.tsx",
    type: GitChangeType.Modified,
    status: GitChangeType.Modified,
    additions: 10,
    deletions: 5,
    diff: "diff --git a/src/components/App.tsx b/src/components/App.tsx\n...",
    isStaged: false,
  },
  {
    path: "src/components/Header.tsx",
    type: GitChangeType.Added,
    status: GitChangeType.Added,
    additions: 20,
    deletions: 0,
    diff: "diff --git a/src/components/Header.tsx b/src/components/Header.tsx\n...",
    isStaged: false,
  },
  {
    path: "src/components/Footer.tsx",
    type: GitChangeType.Modified,
    status: GitChangeType.Modified,
    additions: 5,
    deletions: 3,
    diff: "diff --git a/src/components/Footer.tsx b/src/components/Footer.tsx\n...",
    isStaged: false,
  },
  {
    path: "src/components/Sidebar.tsx",
    type: GitChangeType.Modified,
    status: GitChangeType.Modified,
    additions: 15,
    deletions: 8,
    diff: "diff --git a/src/components/Sidebar.tsx b/src/components/Sidebar.tsx\n...",
    isStaged: false,
  },
  {
    path: "src/components/Settings.tsx",
    type: GitChangeType.Deleted,
    status: GitChangeType.Deleted,
    additions: 0,
    deletions: 50,
    diff: "diff --git a/src/components/Settings.tsx b/src/components/Settings.tsx\n...",
    isStaged: false,
  },
]
