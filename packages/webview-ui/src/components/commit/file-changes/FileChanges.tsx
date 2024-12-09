import { cn } from "@/lib/utils";
import {
  commitFilesAtom,
  commitStatsAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import { FileChange } from "@/state/types";
import { TreeNode } from "@/types/tree-node";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { Section } from "../../layout/Section";
import { DiffViewer } from "../DiffViewer";
import { VIEW_MODES } from "./constants";
import { EmptyState } from "./EmptyState";
import { FileStats } from "./FileStats";
import { FlatView } from "./FlatView";
import { GroupedView } from "./GroupedView";
import { SearchBar } from "./SearchBar";
import { TreeView } from "./TreeView";

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [files] = useAtom(commitFilesAtom);

  const [stats] = useAtom(commitStatsAtom);
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(
    lastOpenedFilePathAtom
  );
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    return files.filter((file) => {
      if (file.path.toLowerCase().includes(query)) return true;
      if (file.content?.toLowerCase().includes(query)) return true;
      if (file.oldContent?.toLowerCase().includes(query)) return true;
      if (file.diff?.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [files, searchQuery]);

  // Group files by status
  const groupedFiles = useMemo(() => {
    const groups = {
      added: [] as FileChange[],
      modified: [] as FileChange[],
      deleted: [] as FileChange[],
      renamed: [] as FileChange[],
    };

    filteredFiles.forEach((file) => {
      const status = file.status as keyof typeof groups;
      if (status in groups) {
        groups[status].push(file);
      }
    });

    return groups;
  }, [filteredFiles]);

  // Build tree structure
  const fileTree = useMemo(() => {
    const root: TreeNode = {
      displayName: "",
      path: "",
      type: "directory",
      children: [], // Initialize children as empty array
    };

    filteredFiles.forEach((file) => {
      let current = root;
      const parts = file.path.split("/");

      // Create directory nodes
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const path = parts.slice(0, i + 1).join("/");
        let node = current.children?.find((n) => n.displayName === part) as
          | TreeNode
          | undefined;

        if (!node) {
          node = {
            displayName: part,
            path,
            type: "directory",
            children: [], // Initialize children as empty array
          };
          if (!current.children) {
            current.children = [];
          }
          current.children.push(node);
        }
        current = node;
      }

      // Add file node
      const fileName = parts[parts.length - 1];
      const filePath = parts.join("/");
      if (!current.children) {
        current.children = [];
      }
      current.children.push({
        displayName: fileName,
        path: filePath,
        type: "file",
        fileInfo: file,
      });
    });

    return root;
  }, [filteredFiles]);

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

  const handleGroupSelect = (files: FileChange[], selected: boolean) => {
    const newSelectedFiles = selected
      ? [...new Set([...selectedFiles, ...files.map((f) => f.path)])]
      : selectedFiles.filter((p) => !files.some((f) => f.path === p));
    setSelectedFiles(newSelectedFiles);
  };

  return (
    <Section
      title={
        <div className="flex items-center gap-4">
          <span>Changed Files</span>
          <FileStats stats={stats} />
        </div>
      }
    >
      <Section.Content className="">
        <div className="flex h-full">
          <div className="w-[300px] flex-none overflow-hidden flex flex-col border-r border-panel-border">
            <div className="sticky top-0 z-10 bg-[var(--vscode-sideBar-background)] border-b border-[var(--vscode-panel-border)]">
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <SearchBar className="w-[240px]" />
                <div className="flex items-center gap-1 p-0.5 rounded-[3px] bg-[var(--vscode-toolbar-activeBackground)]">
                  {(
                    Object.keys(VIEW_MODES) as Array<keyof typeof VIEW_MODES>
                  ).map((mode) => (
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
                  ))}
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
                    selectedPath={lastOpenedFilePath || undefined}
                    searchQuery={searchQuery}
                    onSelect={onFileSelect}
                    onFileClick={handleFileClick}
                  />
                )}
                {viewMode === "grouped" && (
                  <GroupedView
                    groupedFiles={groupedFiles}
                    selectedFiles={selectedFiles}
                    selectedPath={lastOpenedFilePath || undefined}
                    searchQuery={searchQuery}
                    onSelect={onFileSelect}
                    onFileClick={handleFileClick}
                    onGroupSelect={handleGroupSelect}
                  />
                )}
                {viewMode === "tree" && (
                  <TreeView
                    fileTree={fileTree}
                    onFileSelect={onFileSelect}
                    onFileClick={(path) => handleFileClick(path, false)}
                  />
                )}
              </div>
            )}
          </div>
          {!!lastOpenedFilePath && (
            <div className="flex-1 min-w-0 overflow-auto">
              <DiffViewer />
            </div>
          )}
        </div>
      </Section.Content>
    </Section>
  );
};
