/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TreeNode } from "@shared/common"

import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths"

export const getSubDirectories = (fileTree: TreeNode, path: string): string[] => {
  const allDirs = getAllDirectoryPaths(fileTree)
  return allDirs.filter(dir => dir.startsWith(path + "/"))
}
