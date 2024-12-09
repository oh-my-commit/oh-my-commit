import { TreeNode } from "@/types/tree-node";

export const getAllFiles = (node: TreeNode): string[] => {
  if (!node) return [];

  if (node.type === "file" && node.fileInfo?.path) {
    return [node.fileInfo.path];
  }

  // 如果是目录，递归获取所有子文件的路径
  return (node.children || [])
    .filter((child) => child.type === "file" && child.fileInfo?.path)
    .map((child) => child.fileInfo!.path)
    .concat(
      (node.children || [])
        .filter((child) => child.type === "directory")
        .flatMap((child) => getAllFiles(child)),
    );
};
