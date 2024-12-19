import { Section } from "@/components/layout/Section";

import { cn } from "@/lib/utils";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import { FileChange } from "@/state/types";

import { useAtom } from "jotai";
import React, { useCallback, useEffect, useState } from "react";

import { DiffViewer } from "./DiffViewer";
import { EmptyState } from "./EmptyState";
import { FlatView } from "./FlatView";
import { SearchBar } from "./SearchBar";
import { vscodeClientLogger } from "@/lib/vscode-client-logger";
import {
  diffResultAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";

export const FileChanges: React.FC = () => {
  const [diffResult, setDiffResult] = useAtom(diffResultAtom);
  const initialSelection = diffResult?.files?.map((file) => file.file) || [];

  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom
  );
  const [viewMode] = useAtom(viewModeAtom);
  const [searchQuery] = useAtom(searchQueryAtom);

  const handleSelect = useCallback(
    (path: string) => {
      setSelectedFiles(
        selectedFiles.includes(path)
          ? selectedFiles.filter((p) => p !== path)
          : [...selectedFiles, path]
      );
    },
    [selectedFiles]
  );

  const hasSelectionChanged =
    initialSelection.length > 0 &&
    (initialSelection.length !== selectedFiles.length ||
      !initialSelection.every((file) => selectedFiles.includes(file)));

  const handleClick = (path: string) => {
    setLastOpenedFilePath(path);
  };

  const renderFileView = () => {
    if (!diffResult?.files?.length) {
      return <EmptyState />;
    }

    switch (viewMode) {
      case "flat":
        return (
          <FlatView
            selectedFiles={selectedFiles}
            selectedPath={lastOpenedFilePath || undefined}
            searchQuery={searchQuery || ""}
            hasOpenedFile={!!lastOpenedFilePath}
            onSelect={handleSelect}
            onClick={handleClick}
          />
        );
      case "tree":
        return "todo";
      default:
        return null;
    }
  };

  useEffect(() => {
    vscodeClientLogger.setChannel("file-changes");
    vscodeClientLogger.info({
      selectedFiles,
      lastOpenedFilePath,
    });
  }, [selectedFiles, lastOpenedFilePath]);

  return (
    <Section
      title="Changed Files"
      actions={
        hasSelectionChanged ? (
          <div className="shrink-0 text-xs text-[var(--vscode-notificationsInfoIcon-foreground)] flex items-center gap-1">
            <i className="codicon codicon-info" />
            <span>
              File selection changed. You can regenerate the commit message.
            </span>
          </div>
        ) : undefined
      }
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
              <DiffViewer />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};
