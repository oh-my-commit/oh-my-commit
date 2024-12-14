import { useAtom } from "jotai";
import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { EmptyState } from "./EmptyState";
import { FileStats } from "./FileStats";
import { FlatView } from "./FlatView";

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
    <Section title="Changed Files">
      <div className="flex items-center gap-2">
        <SearchBar />
      </div>

      {renderFileView()}

      {lastOpenedFilePath && (
        <DiffViewer
          files={changedFiles}
          lastOpenedFilePath={lastOpenedFilePath}
        />
      )}
    </Section>
  );
};
