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

interface FileChangesProps {
  stagedFiles: FileChange[];
  unstagedFiles: FileChange[];
  selectedFiles: string[];
  onFileSelect: (path: string, isStaged: boolean) => void;
}

interface FileWithStatus extends FileChange {
  hasStaged: boolean;
  hasUnstaged: boolean;
  isStaged: boolean;
}

export const FileChanges: React.FC<FileChangesProps> = ({
  stagedFiles,
  unstagedFiles,
  selectedFiles,
  onFileSelect,
}) => {
  const [lastOpenedFilePath, setLastOpenedFile] = useAtom(
    lastOpenedFilePathAtom
  );
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

    // Create a map to track unique files and their states
    const fileMap = new Map<string, FileWithStatus>();

    // Track staged files
    filteredStagedFiles.forEach((file) => {
      fileMap.set(file.path, {
        ...file,
        hasStaged: true,
        hasUnstaged: false,
        isStaged: true,
      });
    });

    // Update or add unstaged files
    filteredUnstagedFiles.forEach((file) => {
      const existing = fileMap.get(file.path);
      if (existing) {
        existing.hasUnstaged = true;
      } else {
        fileMap.set(file.path, {
          ...file,
          hasStaged: false,
          hasUnstaged: true,
          isStaged: false,
        });
      }
    });

    return Array.from(fileMap.values());
  }, [filteredStagedFiles, filteredUnstagedFiles]);

  const renderStatus = (file: FileChange & { isStaged: boolean }) => {
    const fileWithStatus = file as FileWithStatus;
    const statusClasses = cn(
      "flex items-center gap-1 text-xs",
      fileWithStatus.hasStaged && "text-green-500",
      fileWithStatus.hasUnstaged && "text-yellow-500"
    );

    return (
      <div className={statusClasses}>
        {fileWithStatus.hasStaged && <span>●</span>}
        {fileWithStatus.hasUnstaged && <span>○</span>}
      </div>
    );
  };

  const buildTreeData = (files: FileWithStatus[]) => {
    logger.debug("Building tree data for files:", files.length);
    return {
      path: "",
      type: "directory" as const,
      displayName: "",
      children: buildFileTree(files),
    };
  };

  const fileTree = React.useMemo(() => buildTreeData(allFiles), [allFiles]);

  const handleFileClick = (path: string) => {
    logger.info("File clicked:", path);
    setLastOpenedFile(path === lastOpenedFilePath ? "" : path);
  };

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
                      <span className="text-git-added-fg">A</span> - Added (new
                      file)
                    </li>
                    <li>
                      <span className="text-git-modified-fg">M</span> - Modified
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
      <div className="flex items-center gap-4 px-4 py-2 sticky top-0 z-10 bg-input-bg border-b border-[var(--vscode-panel-border)]">
        <SearchBar className="flex-1 min-w-[200px]" />
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-xs rounded-[3px] transition-colors duration-100 hover:bg-[var(--vscode-toolbar-hoverBackground)]",
            "shrink-0"
          )}
          onClick={() => setViewMode(viewMode === "flat" ? "tree" : "flat")}
          title={`Switch to ${viewMode === "flat" ? "Tree" : "Flat"} View`}
        >
          <i
            className={cn(
              `codicon`,
              viewMode === "flat" && "codicon-list-flat",
              viewMode === "tree" && "codicon-list-tree"
            )}
          />
        </button>
      </div>

      {filteredStagedFiles.length === 0 &&
      filteredUnstagedFiles.length === 0 ? (
        <EmptyState
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : (
        <div className="flex-1 overflow-auto">
          {viewMode === "tree" && (
            <TreeView
              fileTree={fileTree}
              onFileClick={handleFileClick}
              onFileSelect={(path) => onFileSelect(path, true)}
              renderStatus={renderStatus}
            />
          )}

          {viewMode === "flat" && (
            <FlatView
              files={allFiles}
              selectedFiles={selectedFiles}
              selectedPath={lastOpenedFilePath}
              searchQuery={searchQuery}
              onSelect={(path) => onFileSelect(path, true)}
              onFileClick={(path) => handleFileClick(path)}
              hasOpenedFile={!!lastOpenedFilePath}
              renderStatus={renderStatus}
            />
          )}
        </div>
      )}

      {lastOpenedFilePath && (
        <div className="flex-1 min-h-0 border-t border-[var(--vscode-panel-border)]">
          <DiffViewer />
        </div>
      )}
    </Section>
  );
};
