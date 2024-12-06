import {TreeNode} from "@/types/tree-node";

export const getAllFiles = (node: TreeNode): string[] => {
    if (!node) return [];
    
    console.log("getAllFiles called with node:", {
        path: node.path,
        type: node.type,
        childrenCount: node.children?.length || 0,
        fileInfo: node.fileInfo
    });

    if (node.type === "file" && node.fileInfo?.path) {
        const result = [node.fileInfo.path];
        console.log("File node result:", result);
        return result;
    }
    
    // 如果是目录，递归获取所有子文件的路径
    const result = (node.children || []).flatMap(child => getAllFiles(child));
    console.log("Directory node result:", node.path, result);
    return result;
};