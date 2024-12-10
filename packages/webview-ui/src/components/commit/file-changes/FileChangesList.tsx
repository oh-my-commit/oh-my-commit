import React from "react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { TreeView } from "./TreeView";
import { FlatView } from "./FlatView";
import { EmptyState } from "./EmptyState";
import { lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files";
import type { FileChange } from "@/state/types";
import { viewModeAtom } from "@/state/atoms/ui";
import { searchQueryAtom } from "@/state/atoms/search";
import { buildFileTree } from "@/utils/build-file-tree";
import type { TreeNode } from "@/types/tree-node";

interface FileChangesListProps {
  files: FileChange[];
  selectedFiles: string[];
  onFileSelect: (path: string) => void;
}

export const FileChangesList: React.FC<FileChangesListProps> = ({
  files,
  selectedFiles,
  onFileSelect,
}) => {
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(lastOpenedFilePathAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

  const filteredFiles = React.useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => file.path.toLowerCase().includes(query));
  }, [files, searchQuery]);

  const fileTree = React.useMemo(() => {
    const children = buildFileTree(filteredFiles);
    return {
      path: "",
      type: "directory" as const,
      displayName: "",
      children,
    };
  }, [filteredFiles]);

  const handleFileClick = (path: string) => {
    if (path === lastOpenedFilePath) {
      setLastOpenedFile("");
    } else {
      setLastOpenedFile(path);
    }
  };

  if (filteredFiles.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        onClearSearch={() => setSearchQuery("")}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-1">
        <SearchBar className="w-full sm:w-[240px] min-w-[120px]" />
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs rounded-[3px] transition-colors duration-100 hover:bg-[var(--vscode-toolbar-hoverBackground)]",
            "self-end sm:self-auto"
          )}
          onClick={() =>
            setViewMode(viewMode === "flat" ? "grouped" : "flat")
          }
          title={`Switch to ${viewMode === "flat" ? "Grouped" : "Flat"} View`}
        >
          <i className={`codicon codicon-${viewMode === "flat" ? "list-tree" : "list-flat"}`} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === "grouped" ? (
          <TreeView
            fileTree={fileTree}
            onFileClick={handleFileClick}
            onFileSelect={onFileSelect}
          />
        ) : (
          <FlatView
            files={filteredFiles}
            selectedFiles={selectedFiles}
            selectedPath={lastOpenedFilePath}
            searchQuery={searchQuery}
            onSelect={onFileSelect}
            onFileClick={handleFileClick}
            hasOpenedFile={!!lastOpenedFilePath}
          />
        )}
      </div>
    </div>
  );
};
