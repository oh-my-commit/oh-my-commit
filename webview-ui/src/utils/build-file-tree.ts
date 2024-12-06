import { CommitState } from "@/types/commit-state";
import { TreeNode } from "@/types/tree-node";

export const buildFileTree = (files: CommitState["filesChanged"]): TreeNode[] => {
  const root: { [key: string]: TreeNode } = {};

  files.forEach((file) => {
    if (!file || !file.path) return; // Skip if file or path is undefined

    const parts = file.path.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join("/");

      if (!current[currentPath]) {
        current[currentPath] = {
          path: currentPath,
          displayName: part,
          type: index === parts.length - 1 ? "file" : "directory",
          children: [],
          fileInfo: index === parts.length - 1 ? file : undefined,
        };
      }

      if (index < parts.length - 1) {
        const parentPath = parts.slice(0, index + 1).join("/");
        const childPath = parts.slice(0, index + 2).join("/");

        // Ensure parent has children array
        if (!current[parentPath].children) {
          current[parentPath].children = [];
        }

        // Add child to parent if not already present
        if (!current[childPath]) {
          current[childPath] = {
            path: childPath,
            displayName: parts[index + 1],
            type: index === parts.length - 2 ? "file" : "directory",
            children: [],
            fileInfo:
              index === parts.length - 2 ? file : undefined,
          };
        }

        // Only add to children array if not already there
        const existingChild = current[parentPath].children.find(
          (child) => child.path === childPath
        );
        if (!existingChild) {
          current[parentPath].children.push(current[childPath]);
        }
      }

      current = current;
    });
  });

  // Convert root object to array and sort
  return Object.values(root)
    .filter((node) => !node.path.includes("/"))
    .sort((a, b) => {
      // 目录排在前面
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      // 同类型按名称排序
      return a.displayName.localeCompare(b.displayName);
    });
};