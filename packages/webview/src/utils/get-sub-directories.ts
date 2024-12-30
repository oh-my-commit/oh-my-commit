/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { TreeNode } from "@shared/common"

import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths"

export const getSubDirectories = (fileTree: TreeNode, path: string): string[] => {
  const allDirs = getAllDirectoryPaths(fileTree)
  return allDirs.filter((dir) => dir.startsWith(path + "/"))
}
