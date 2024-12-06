import {CommitState} from "@/types/commit-state";
import {TreeNode} from "@/types/tree-node";

export const buildFileTree = (
    files: CommitState["filesChanged"]
): TreeNode[] => {
    const root: { [key: string]: TreeNode } = {};

    files.forEach((file) => {
        if (!file || !file.path) return; // Skip if file or path is undefined

        const parts = file.path.split("/");
        let current = root;

        parts.forEach((part, index) => {
            const currentPath = parts.slice(0, index + 1).join("/");

            if (!current[currentPath]) {
                current[currentPath] = {
                    path: part,
                    type: index === parts.length - 1 ? "file" : "directory",
                    children: [],
                    fileInfo:
                        index === parts.length - 1
                            ? {...file, path: file.path}
                            : undefined,
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
                        path: parts[index + 1],
                        type: index === parts.length - 2 ? "file" : "directory",
                        children: [],
                    };
                }

                // Only add to children array if not already there
                const existingChild = current[parentPath].children.find(
                    (child) => child.path === parts[index + 1]
                );
                if (!existingChild) {
                    current[parentPath].children.push(current[childPath]);
                }
            }
        });
    });

    // Return only top-level nodes
    return Object.values(root)
        .filter((node) => !node.path.includes("/"))
        .sort((a, b) => {
            // Sort directories before files, then alphabetically
            if (a.type === "directory" && b.type === "file") return -1;
            if (a.type === "file" && b.type === "directory") return 1;
            return a.path.localeCompare(b.path);
        });
};