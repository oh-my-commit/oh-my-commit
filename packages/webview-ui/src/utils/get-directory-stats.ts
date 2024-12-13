import { getAllFiles } from "@/utils/get-all-files";
import { TreeNode } from "@yaac/shared";

export const getDirectoryStats = (
  node: TreeNode,
  selectedFiles: Set<string>
) => {
  const allFiles = getAllFiles(node);
  const selectedFilesInDir = allFiles.filter((f) => selectedFiles.has(f));

  const stats = node.children?.reduce(
    (acc, child) => {
      if (
        child.type === "file" &&
        child.fileInfo &&
        selectedFiles.has(child.fileInfo.path)
      ) {
        acc.additions += child.fileInfo.additions;
        acc.deletions += child.fileInfo.deletions;
      } else if (child.type === "directory") {
        const childStats = getDirectoryStats(child, selectedFiles);
        acc.additions += childStats.additions;
        acc.deletions += childStats.deletions;
      }
      return acc;
    },
    { additions: 0, deletions: 0 }
  ) || { additions: 0, deletions: 0 };

  return {
    totalFiles: allFiles.length,
    selectedFiles: selectedFilesInDir.length,
    ...stats,
  };
};
