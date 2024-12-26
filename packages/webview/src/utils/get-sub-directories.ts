// Get all subdirectories under a path
import type { TreeNode } from "@shared/common"

import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths"

export const getSubDirectories = (fileTree: TreeNode, path: string): string[] => {
  const allDirs = getAllDirectoryPaths(fileTree)
  return allDirs.filter(dir => dir.startsWith(path + "/"))
}
