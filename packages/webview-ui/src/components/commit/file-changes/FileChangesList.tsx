import React from "react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { FlatView } from "./FlatView";
import { GroupedView } from "./GroupedView";
import { TreeView } from "./TreeView";
import { EmptyState } from "./EmptyState";
import {
  commitFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import type { FileChange } from "@/state/types";
import { buildFileTree } from "@/utils/build-file-tree";
import type { TreeNode } from "@/types/tree-node";

const VIEW_MODES = {
  flat: {
    label: "Flat View",
    icon: "list-flat",
  },
  grouped: {
    label: "Grouped View",
    icon: "list-tree",
  },
  tree: {
    label: "Tree View",
    icon: "list-tree",
  },
} as const;

interface FileChangesListProps {
  onFileSelect?: (path: string) => void;
}

export const FileChangesList: React.FC<FileChangesListProps> = ({
  onFileSelect,
}) => {
  const [files] = useAtom(commitFilesAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(
    lastOpenedFilePathAtom
  );
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.path.toLowerCase().includes(query));
  }, [files, searchQuery]);

  const handleFileClick = (path: string, metaKey: boolean) => {
    if (metaKey) {
      onFileSelect?.(path);
    } else if (path === lastOpenedFilePath) {
      setLastOpenedFile("");
      onFileSelect?.(path);
    } else {
      setLastOpenedFile(path);
      if (!selectedFiles.includes(path)) {
        onFileSelect?.(path);
      }
    }
  };

  const handleSelect = (path: string) => {
    if (!selectedFiles.includes(path)) {
      setSelectedFiles([...selectedFiles, path]);
    } else {
      setSelectedFiles(selectedFiles.filter((p) => p !== path));
    }
    onFileSelect?.(path);
  };

  const handleGroupSelect = (files: FileChange[], checked: boolean) => {
    if (checked) {
      const newPaths = files
        .map((f) => f.path)
        .filter((path) => !selectedFiles.includes(path));
      setSelectedFiles([...selectedFiles, ...newPaths]);
    } else {
      const pathsToRemove = new Set(files.map((f) => f.path));
      setSelectedFiles(
        selectedFiles.filter((path) => !pathsToRemove.has(path))
      );
    }
  };

  // Group files by status
  const groupedFiles = React.useMemo(() => {
    const groups = {
      added: [] as FileChange[],
      modified: [] as FileChange[],
      deleted: [] as FileChange[],
      renamed: [] as FileChange[],
      default: [] as FileChange[],
    };

    filteredFiles.forEach((file) => {
      const status = file.status as keyof typeof groups;
      if (status in groups) {
        groups[status].push(file);
      }
    });

    return groups;
  }, [filteredFiles]);

  const fileTree = React.useMemo(() => {
    const children = buildFileTree(filteredFiles);
    const root: TreeNode = {
      path: "",
      type: "directory",
      displayName: "",
      children,
    };
    return root;
  }, [filteredFiles]);

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10  border-b border-[var(--vscode-panel-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2">
          <SearchBar className="w-full sm:w-[240px] min-w-[120px]" />
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-xs rounded-[3px] transition-colors duration-100 hover:bg-[var(--vscode-toolbar-hoverBackground)]",
              "self-end sm:self-auto"
            )}
            onClick={() =>
              setViewMode(viewMode === "flat" ? "grouped" : viewMode === "grouped" ? "tree" : "flat")
            }
            title={`Switch to ${
              VIEW_MODES[viewMode === "flat" ? "grouped" : viewMode === "grouped" ? "tree" : "flat"].label
            }`}
          >
            <i className={`codicon codicon-${VIEW_MODES[viewMode].icon}`} />
          </button>
        </div>
      </div>

      {filteredFiles.length === 0 && searchQuery ? (
        <EmptyState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <div className="flex-1 min-h-0 overflow-auto scrollbar-gutter-stable">
          {viewMode === "flat" && (
            <FlatView
              files={filteredFiles}
              selectedFiles={selectedFiles}
              selectedPath={lastOpenedFilePath}
              searchQuery={searchQuery}
              onSelect={handleSelect}
              onFileClick={handleFileClick}
              hasOpenedFile={!!lastOpenedFilePath}
            />
          )}
          {viewMode === "grouped" && (
            <GroupedView
              groupedFiles={groupedFiles}
              selectedFiles={selectedFiles}
              selectedPath={lastOpenedFilePath}
              searchQuery={searchQuery}
              onSelect={handleSelect}
              onFileClick={handleFileClick}
              onGroupSelect={handleGroupSelect}
              hasOpenedFile={!!lastOpenedFilePath}
            />
          )}
          {viewMode === "tree" && (
            <TreeView
              fileTree={fileTree}
              onFileSelect={handleSelect}
              onFileClick={(path) => handleFileClick(path, false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
