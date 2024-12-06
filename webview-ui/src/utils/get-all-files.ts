import {TreeNode} from "@/types/tree-node";

export const getAllFiles = (node: TreeNode): string[] => {
    if (!node) return [];
    if (node.type === "file" && node.fileInfo?.path) return [node.fileInfo.path];
    return (node.children || []).reduce<string[]>(
        (acc, child) => [...acc, ...getAllFiles(child)],
        []
    );
}; // 获取目录的统计信息