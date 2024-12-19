import { TreeNode } from "@oh-my-commit/shared/common";

export function getAllDirectoryPaths(node: TreeNode): string[] {
  const paths: string[] = [];

  if (node.type === "directory") {
    paths.push(node.path);

    if (node.children) {
      node.children.forEach((child) => {
        if (child.type === "directory") {
          paths.push(...getAllDirectoryPaths(child));
        }
      });
    }
  }

  return paths;
}
