/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { TreeNode } from "@shared/common"

export function getDirectoryStats(node: TreeNode): TreeNode["stats"] {
  const stats = {
    totalFiles: 0,
    totalDirectories: 0,
    totalSize: 0,
  }

  if (node.type === "directory" && node.children) {
    node.children.forEach((child) => {
      if (child.type === "directory") {
        stats.totalDirectories++
        const childStats = getDirectoryStats(child)
        if (childStats) {
          stats.totalFiles += childStats.totalFiles
          stats.totalDirectories += childStats.totalDirectories
          stats.totalSize += childStats.totalSize
        }
      } else {
        stats.totalFiles++
        if (child.fileInfo) {
          stats.totalSize += child.fileInfo.size
        }
      }
    })
  }

  return stats
}
