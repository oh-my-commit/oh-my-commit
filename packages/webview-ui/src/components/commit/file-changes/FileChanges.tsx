import { Section } from "@/components/layout/Section";

import { cn } from "@/lib/utils";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import { FileChange } from "@/state/types";
import { GitChangeSummary } from "@oh-my-commits/shared/types";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";

import { DiffViewer } from "./DiffViewer";
import { EmptyState } from "./EmptyState";
import { FlatView } from "./FlatView";
import { SearchBar } from "./SearchBar";
import { logger } from "@/lib/logger";

interface FileChangesProps {
  changedFiles: GitChangeSummary | null;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  lastOpenedFilePath: string | null;
  setLastOpenedFilePath: (path: string | null) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({
  changedFiles,
  selectedFiles,
  setSelectedFiles,
  lastOpenedFilePath,
  setLastOpenedFilePath,
}) => {
  const [viewMode] = useAtom(viewModeAtom);
  const [searchQuery] = useAtom(searchQueryAtom);
  const [initialSelection, setInitialSelection] = useState<string[]>([]);

  useEffect(() => {
    if (changedFiles?.files?.length && selectedFiles.length === 0) {
      const allFiles = changedFiles.files.map((file) => file.path);
      setSelectedFiles(allFiles);
      setInitialSelection(allFiles);
    }
  }, [changedFiles, setSelectedFiles, selectedFiles.length]);

  useEffect(() => {
    if (changedFiles?.files?.length && initialSelection.length === 0) {
      const allFiles = changedFiles.files.map((file) => file.path);
      setInitialSelection(allFiles);
    }
  }, [changedFiles]);

  const handleFileSelect = (path: string) => {
    setSelectedFiles(
      selectedFiles.includes(path)
        ? selectedFiles.filter((p) => p !== path)
        : [...selectedFiles, path]
    );
  };

  const hasSelectionChanged =
    initialSelection.length > 0 &&
    (initialSelection.length !== selectedFiles.length ||
      !initialSelection.every((file) => selectedFiles.includes(file)));

  logger.info("initialSelection: ", initialSelection);
  logger.info("selectedFiles: ", selectedFiles);
  logger.info("hasSelectionChanged: ", hasSelectionChanged);

  const handleFileClick = (path: string) => {
    setLastOpenedFilePath(path);
  };

  const renderFileView = () => {
    if (!changedFiles?.files?.length) {
      return <EmptyState />;
    }

    const fileChanges: FileChange[] = changedFiles.files.map((file) => ({
      ...file,
      type: file.status,
      isStaged: false,
    }));

    switch (viewMode) {
      case "flat":
        return (
          <FlatView
            files={fileChanges}
            selectedFiles={selectedFiles}
            selectedPath={lastOpenedFilePath || undefined}
            searchQuery={searchQuery || ""}
            hasOpenedFile={!!lastOpenedFilePath}
            onSelect={handleFileSelect}
            onFileClick={(path) => handleFileClick(path)}
          />
        );
      case "tree":
        return "todo";
      default:
        return null;
    }
  };

  return (
    <Section
      title="Changed Files"
      actions={hasSelectionChanged ? (
        <div className="shrink-0 text-xs text-[var(--vscode-notificationsInfoIcon-foreground)] flex items-center gap-1">
          <i className="codicon codicon-info" />
          <span>
            File selection changed. You can regenerate the commit message.
          </span>
        </div>
      ) : undefined}
    >
      <div className="flex flex-col sm:flex-row h-full relative">
        <div className="w-full sm:max-w-[300px] flex flex-col pr-[1px] shrink-0">
          <div className="flex items-center gap-2 mb-2 w-full z-10 py-1">
            <SearchBar />
          </div>
          <div className="overflow-y-auto vscode-scrollbar">
            {renderFileView()}
          </div>
        </div>

        <div
          className={cn(
            "flex-1 border-l border-[var(--vscode-panel-border)] pl-3 transition-all duration-200 ease-in-out",
            !lastOpenedFilePath && "opacity-0"
          )}
        >
          {lastOpenedFilePath && (
            <div className="sticky top-0 h-full">
              <DiffViewer
                files={changedFiles}
                lastOpenedFilePath={lastOpenedFilePath}
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};
