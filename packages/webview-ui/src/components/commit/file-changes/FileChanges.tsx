import { useAtom } from "jotai";
import React, { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { EmptyState } from "./EmptyState";
import { FileStats } from "./FileStats";
import { FlatView } from "./FlatView";
import { GroupedView } from "./GroupedView";
import { DiffViewer } from "./DiffViewer";
import { SearchBar } from "./SearchBar";
import {
  changedFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import { GitChangeSummary, GitFileChange } from "@yaac/shared";
import { logger } from "@/lib/logger";
import { VIEW_MODES } from "./constants";
import { cn } from "@/lib/utils";
import { Section } from "@/components/layout/Section";
import { InfoIcon } from "@/components/commit/info-icon";
import { buildFileTree } from "@/utils/build-file-tree";
import { FileChange } from "@/state/types";

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

  const handleFileSelect = (path: string) => {
    setSelectedFiles(
      selectedFiles.includes(path)
        ? selectedFiles.filter((p) => p !== path)
        : [...selectedFiles, path]
    );
  };

  const handleFileClick = (path: string) => {
    setLastOpenedFilePath(path);
  };

  const renderFileView = () => {
    if (!changedFiles?.files?.length) {
      return <EmptyState />;
    }

    const filteredFiles = searchQuery
      ? changedFiles.files.filter((file) =>
          file.path.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : changedFiles.files;

    const fileChanges: FileChange[] = filteredFiles.map((file) => ({
      ...file,
      type: file.status,
      isStaged: false,
    }));

    switch (viewMode) {
      case VIEW_MODES.FLAT:
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
      case VIEW_MODES.GROUPED:
        return (
          <GroupedView
            files={filteredFiles}
            selectedFiles={selectedFiles}
            selectedPath={lastOpenedFilePath || undefined}
            searchQuery={searchQuery || ""}
            onSelect={handleFileSelect}
            onFileClick={handleFileClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Section>
        <div className="flex items-center gap-2">
          <SearchBar />
          <div
            ref={useRef<HTMLDivElement>(null)}
            className="relative"
            onMouseEnter={() => useState(true)}
            onMouseLeave={() => useState(false)}
          >
            <InfoIcon />
            {useState(false) && (
              <div className="absolute z-10 p-2 text-xs bg-white border rounded shadow-lg">
                <p>Search in file paths</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section className="flex-1 overflow-auto">
        {renderFileView()}
      </Section>

      {lastOpenedFilePath && (
        <Section>
          <DiffViewer files={changedFiles} lastOpenedFilePath={lastOpenedFilePath} />
        </Section>
      )}
    </div>
  );
};
