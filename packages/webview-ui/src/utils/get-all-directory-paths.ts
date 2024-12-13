import { TreeNode } from "@yaac/shared";

export const getAllDirectoryPaths = (
  node: TreeNode,
  parentPath: string = ""
): string[] => {
  const currentPath = parentPath
    ? `${parentPath}/${node.displayName}`
    : node.displayName;
  if (node.type === "directory" && node.children) {
    return [
      currentPath,
      ...node.children.flatMap((child) =>
        getAllDirectoryPaths(child, currentPath)
      ),
    ];
  }
  return [];
};
