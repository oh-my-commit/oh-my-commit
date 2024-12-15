import { Section } from "@/components/layout/Section";

import { cn } from "@/lib/utils";
import { searchQueryAtom } from "@/state/atoms/search";
import { viewModeAtom } from "@/state/atoms/ui";
import { FileChange } from "@/state/types";
import { GitChangeSummary } from "@oh-my-commits/shared/types";
import { useAtom } from "jotai";
import React from "react";

import { DiffViewer } from "./DiffViewer";
import { EmptyState } from "./EmptyState";
import { FlatView } from "./FlatView";
import { SearchBar } from "./SearchBar";

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
        : [...selectedFiles, path],
    );
  };

  const handleFileClick = (path: string) => {
    setLastOpenedFilePath(path);
  };

  const renderFileView = () => {
    if (!changedFiles?.files?.length) {
      return <EmptyState />;
    }

    // 移除文件名过滤，让 FileItem 组件处理所有匹配逻辑
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
    <Section title="Changed Files">
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
            !lastOpenedFilePath && "opacity-0",
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
