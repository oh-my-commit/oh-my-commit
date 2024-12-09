import React from "react";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { FlatView } from "./FlatView";
import { GroupedView } from "./GroupedView";
import { EmptyState } from "./EmptyState";
import {
  commitFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import type { FileChange } from "@/state/types";

const VIEW_MODES = {
  flat: "Flat",
  grouped: "Grouped",
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

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-[var(--vscode-sideBar-background)] border-b border-[var(--vscode-panel-border)]">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <SearchBar className="w-[240px]" />
          <div className="flex items-center gap-1 p-0.5 rounded-[3px] bg-[var(--vscode-toolbar-activeBackground)]">
            {(Object.keys(VIEW_MODES) as Array<keyof typeof VIEW_MODES>).map(
              (mode) => (
                <button
                  key={mode}
                  className={cn(
                    "px-2 py-1 text-xs rounded-[3px] transition-colors duration-100",
                    viewMode === mode
                      ? "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)]"
                      : "hover:bg-[var(--vscode-toolbar-hoverBackground)]"
                  )}
                  onClick={() => setViewMode(mode)}
                >
                  {VIEW_MODES[mode]}
                </button>
              )
            )}
          </div>
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
        </div>
      )}
    </div>
  );
};
