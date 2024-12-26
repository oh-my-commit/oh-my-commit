/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TreeNode } from "@shared/common"

export function getAllDirectoryPaths(node: TreeNode): string[] {
  const paths: string[] = []

  if (node.type === "directory") {
    paths.push(node.path)

    if (node.children) {
      node.children.forEach(child => {
        if (child.type === "directory") {
          paths.push(...getAllDirectoryPaths(child))
        }
      })
    }
  }

  return paths
}
