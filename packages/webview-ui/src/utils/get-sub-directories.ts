// Get all subdirectories under a path

import { getAllDirectoryPaths } from "@/utils/get-all-directory-paths";
import { TreeNode } from "@oh-my-commits/shared/types";

export const getSubDirectories = (
  fileTree: TreeNode,
  path: string,
): string[] => {
  const allDirs = getAllDirectoryPaths(fileTree);
  return allDirs.filter((dir) => dir.startsWith(path + "/"));
};
