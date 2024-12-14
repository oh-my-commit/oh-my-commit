import { CommitMessage } from "@/components/commit/core/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { Footer } from "@/components/footer";
import { useCloseWindow } from "@/hooks/use-close-window";
import {
  changedFilesAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { CommitEvent } from "@yaac/shared/types/commit";
import { GitChangeType, GitChangeSummary, GitFileChange } from "@yaac/shared";
import type { DiffResultTextFile } from "simple-git";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { logger } from "@/lib/logger";

interface GitDiffFile {
  file: string;
  changes: number;
  insertions: number;
  deletions: number;
  binary: boolean;
  type: "A" | "D" | "M";
}

export const CommitPage = () => {
  const [title, setTitle] = useAtom(commitTitleAtom);
  const [body, setBody] = useAtom(commitBodyAtom);
  const [changedFiles, setChangedFiles] = useAtom(changedFilesAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom
  );

  useCloseWindow();

  const convertDiffToFileChange = (file: GitDiffFile): GitFileChange => {
    return {
      path: file.file,
      status:
        file.type === "A"
          ? GitChangeType.Added
          : file.type === "D"
          ? GitChangeType.Deleted
          : GitChangeType.Modified,
      additions: file.binary ? 0 : file.insertions,
      deletions: file.binary ? 0 : file.deletions,
      diff: "",
    };
  };

  const handleSetSelectedFiles = (files: string[]) => {
    setSelectedFiles(files);
  };

  const handleSetLastOpenedFilePath = (path: string | null) => {
    setLastOpenedFilePath(path);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "git-changes":
          break;

        case "commit":
          const data = message.data as CommitEvent;
          logger.info("received commit event: ", data);
          if (data.message.isOk()) {
            setTitle(data.message.value.title);
            setBody(data.message.value.body ?? "");
            if (data.diffSummary.files) {
              const summary: GitChangeSummary = {
                changed: data.diffSummary.files.length,
                files: data.diffSummary.files.map((file) =>
                  convertDiffToFileChange(file as GitDiffFile)
                ),
                insertions: data.diffSummary.insertions,
                deletions: data.diffSummary.deletions,
              };
              setChangedFiles(summary);
            }
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setTitle, setBody, setChangedFiles]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <CommitMessage />
        <FileChanges
          changedFiles={changedFiles}
          selectedFiles={selectedFiles}
          setSelectedFiles={handleSetSelectedFiles}
          lastOpenedFilePath={lastOpenedFilePath}
          setLastOpenedFilePath={handleSetLastOpenedFilePath}
        />
      </div>
      <Footer />
    </div>
  );
};
