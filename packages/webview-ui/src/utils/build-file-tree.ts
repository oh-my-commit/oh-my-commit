import { GitFileChange, TreeNode } from "@oh-my-commits/shared";

function createFileNode(file: GitFileChange): TreeNode {
  return {
    name: file.path.split("/").pop() || "",
    path: file.path,
    type: "file",
    displayName: file.path,
    fileInfo: {
      path: file.path,
      size: 0, // Size not available from git change
      type: "file",
      modified: new Date().toISOString(), // Modification time not available from git change
      additions: file.additions,
      deletions: file.deletions,
      status: file.status,
    },
  };
}

function createDirectoryNode(path: string): TreeNode {
  return {
    name: path.split("/").pop() || "",
    path,
    type: "directory",
    displayName: path,
    children: [],
  };
}

export function buildFileTree(files: GitFileChange[]): TreeNode {
  const root: TreeNode = createDirectoryNode("");
  root.children = [];

  for (const file of files) {
    const pathParts = file.path.split("/");
    let currentNode = root;

    // Create directory nodes
    for (let i = 0; i < pathParts.length - 1; i++) {
      const pathSoFar = pathParts.slice(0, i + 1).join("/");
      let childNode = currentNode.children?.find(
        (child) => child.type === "directory" && child.path === pathSoFar
      );

      if (!childNode) {
        childNode = createDirectoryNode(pathSoFar);
        currentNode.children = currentNode.children || [];
        currentNode.children.push(childNode);
      }

      currentNode = childNode;
    }

    // Add file node
    currentNode.children = currentNode.children || [];
    currentNode.children.push(createFileNode(file));
  }

  // Sort nodes by displayName
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.sort((a, b) => {
      // Directories come before files
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      // Sort by displayName within same type
      return (a.displayName || "").localeCompare(b.displayName || "");
    });
  };

  // Recursively sort all nodes
  const sortTreeNodes = (node: TreeNode): void => {
    if (node.children) {
      node.children = sortNodes(node.children);
      node.children.forEach(sortTreeNodes);
    }
  };

  sortTreeNodes(root);
  return root;
}
