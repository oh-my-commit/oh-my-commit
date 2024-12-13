import React, { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { FileChange } from "@/state/types";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

import { DiffViewer } from "../DiffViewer";
import { SearchBar } from "./SearchBar";
import { TreeView } from "./TreeView";
import { FlatView } from "./FlatView";
import { EmptyState } from "./EmptyState";
import { lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files";
import { viewModeAtom } from "@/state/atoms/ui";
import { searchQueryAtom } from "@/state/atoms/search";
import { buildFileTree } from "@/utils/build-file-tree";
import { Section } from "@/components/layout/Section";
import { InfoIcon } from "@/components/commit/info-icon";
import { STATUS_COLORS, STATUS_LETTERS } from "./constants";

interface FileChangesProps {
  stagedFiles: FileChange[];
  unstagedFiles: FileChange[];
  selectedFiles: string[];
  onFileSelect: (path: string, isStaged: boolean) => void;
}

type FileChangeWithStaged = FileChange & { isStaged: boolean };

export const FileChanges: React.FC<FileChangesProps> = ({
  stagedFiles,
  unstagedFiles,
  selectedFiles,
  onFileSelect,
}) => {
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(lastOpenedFilePathAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);

  const filterFiles = (files: FileChange[]) => {
    if (!searchQuery) return files;
    const query = searchQuery.toLowerCase();
    logger.debug("Filtering files with query:", query);
    return files.filter((file) => file.path.toLowerCase().includes(query));
  };

  const filteredStagedFiles = filterFiles(stagedFiles);
  const filteredUnstagedFiles = filterFiles(unstagedFiles);

  const allFiles = React.useMemo(() => {
    logger.debug("Updating allFiles:", {
      stagedCount: filteredStagedFiles.length,
      unstagedCount: filteredUnstagedFiles.length,
    });
    return [
      ...filteredStagedFiles.map((file) => ({ ...file, isStaged: true })),
      ...filteredUnstagedFiles.map((file) => ({ ...file, isStaged: false })),
    ] as FileChangeWithStaged[];
  }, [filteredStagedFiles, filteredUnstagedFiles]);

  const buildTreeData = (files: FileChangeWithStaged[]) => {
    logger.debug("Building tree data for files:", files.length);
    const children = buildFileTree(files);
    return {
      path: "",
      type: "directory" as const,
      displayName: "",
      children,
    };
  };

  const fileTree = React.useMemo(() => buildTreeData(allFiles), [allFiles]);

  const handleFileClick = (path: string) => {
    logger.info("File clicked:", path);
    setLastOpenedFile(path === lastOpenedFilePath ? "" : path);
  };

  const renderStatus = (file: FileChangeWithStaged) => (
    <div className="flex items-center gap-1">
      <span className={cn(
        "mr-1",
        file.isStaged 
          ? "text-[var(--vscode-gitDecoration-stageModifiedResourceForeground)]"
          : "text-[var(--vscode-descriptionForeground)]"
      )}>
        {file.isStaged ? "●" : "○"}
      </span>
      <span className={cn(
        "text-xs font-medium",
        STATUS_COLORS[file.type]
      )}>
        {STATUS_LETTERS[file.type]}
      </span>
    </div>
  );

  useEffect(() => {
    logger.setChannel("FileChanges");
    logger.info("Component mounted with:", {
      stagedFiles: stagedFiles.length,
      unstagedFiles: unstagedFiles.length,
      selectedFiles: selectedFiles.length,
      viewMode,
      lastOpenedFilePath,
    });

    return () => {
      logger.info("Component unmounting");
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2 py-1 sticky top-0 z-10 bg-[var(--vscode-sideBar-background)]">
        <div className="flex items-center gap-2">
          <SearchBar className="w-full sm:w-[240px] min-w-[120px]" />
          <div className="flex items-center gap-1 text-xs text-[var(--vscode-descriptionForeground)]">
            <span className="text-[var(--vscode-gitDecoration-stageModifiedResourceForeground)]">
              {filteredStagedFiles.length} staged
            </span>
            <span>·</span>
            <span>{filteredUnstagedFiles.length} unstaged</span>
          </div>
        </div>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs rounded-[3px] transition-colors duration-100 hover:bg-[var(--vscode-toolbar-hoverBackground)]",
            "self-end sm:self-auto"
          )}
          onClick={() => setViewMode(viewMode === "flat" ? "grouped" : "flat")}
          title={`Switch to ${viewMode === "flat" ? "Grouped" : "Flat"} View`}
        >
          <i
            className={`codicon codicon-${
              viewMode === "flat" ? "list-tree" : "list-flat"
            }`}
          />
        </button>
      </div>

      <Section
        title="Changed Files"
        actions={
          <div
            ref={tooltipContainerRef}
            className="relative inline-flex items-center"
          >
            <button
              className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <InfoIcon />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]">
                <div className="text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3">
                  <div>
                    <p className="font-semibold mb-1">About Changed Files</p>
                    <p>Files are marked with their status and staging state:</p>
                    <ul className="ml-2 mt-1 space-y-1">
                      <li>
                        <span className="text-git-added-fg">A</span> - Added
                        (new file)
                      </li>
                      <li>
                        <span className="text-git-modified-fg">M</span> -
                        Modified
                      </li>
                      <li>
                        <span className="text-git-deleted-fg">D</span> - Deleted
                      </li>
                      <li>
                        <span className="text-git-renamed-fg">R</span> - Renamed
                      </li>
                      <li className="mt-2">
                        <span className="text-[var(--vscode-gitDecoration-stageModifiedResourceForeground)]">
                          ●
                        </span>{" "}
                        - Staged for commit
                      </li>
                      <li>
                        <span className="text-[var(--vscode-descriptionForeground)]">
                          ○
                        </span>{" "}
                        - Not staged
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      >
        {allFiles.length === 0 ? (
          <EmptyState
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />
        ) : (
          <div className="flex-1 overflow-auto">
            {viewMode === "grouped" ? (
              <TreeView
                fileTree={fileTree}
                onFileClick={handleFileClick}
                onFileSelect={(path) => {
                  const file = allFiles.find((f) => f.path === path);
                  if (file) {
                    onFileSelect(path, !file.isStaged);
                  }
                }}
                renderStatus={renderStatus}
              />
            ) : (
              <FlatView
                files={allFiles}
                selectedFiles={selectedFiles}
                selectedPath={lastOpenedFilePath}
                searchQuery={searchQuery}
                onSelect={(path) => {
                  const file = allFiles.find((f) => f.path === path);
                  if (file) {
                    onFileSelect(path, !file.isStaged);
                  }
                }}
                onFileClick={handleFileClick}
                hasOpenedFile={!!lastOpenedFilePath}
                renderStatus={renderStatus}
              />
            )}
          </div>
        )}
      </Section>

      {lastOpenedFilePath && <DiffViewer />}
    </div>
  );
};
