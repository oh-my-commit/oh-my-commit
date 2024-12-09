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
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { Section } from "../../layout/Section";
import { DiffViewer } from "../DiffViewer";
import { VIEW_MODES } from "./constants";
import { FlatView } from "./FlatView";
import { GroupedView } from "./GroupedView";
import { TreeView } from "./TreeView";

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [files] = useAtom(commitFilesAtom);

  const [stats] = useAtom(commitStatsAtom);
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(
    lastOpenedFilePathAtom,
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
    <Section title="Changed Files">
      <Section.Content>
        <div className="flex items-center gap-2 px-2 py-1.5 sticky top-0 z-10">
          <div className="relative flex-1 flex items-center">
            <i className="codicon codicon-search absolute left-2 translate-y-[2px] text-[12px] opacity-50 pointer-events-none z-10" />
            <style>
              {`
                .search-input::part(control) {
                  padding-left: 24px !important;
                }
              `}
            </style>
            <VSCodeTextField
              className="w-full search-input"
              placeholder="Filter"
              value={searchQuery}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                setSearchQuery(target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--vscode-descriptionForeground)]">
            <span>{Object.values(stats).reduce((a, b) => a + b, 0)} files</span>
            <span>·</span>
            <span className="text-[var(--vscode-gitDecoration-addedResourceForeground)]">
              +{stats.added}
            </span>
            <span>·</span>
            <span className="text-[var(--vscode-gitDecoration-deletedResourceForeground)]">
              -{stats.deleted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          {(Object.keys(VIEW_MODES) as Array<keyof typeof VIEW_MODES>).map(
            (mode) => (
              <button
                key={mode}
                className={cn(
                  "px-2 py-1 text-xs rounded-sm",
                  viewMode === mode
                    ? "bg-[var(--vscode-toolbar-activeBackground)]"
                    : "hover:bg-[var(--vscode-toolbar-hoverBackground)]",
                )}
                onClick={() => setViewMode(mode)}
              >
                {VIEW_MODES[mode]}
              </button>
            ),
          )}
        </div>

        <div className="flex-1 overflow-auto px-2">
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
      </Section.Content>

      {!!lastOpenedFilePath && <DiffViewer />}
    </Section>
  );
};
