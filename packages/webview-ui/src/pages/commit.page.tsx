import { Footer } from "@/components/footer";
import {
  commitFilesAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files";
import {
  commitDetailAtom,
  commitMessageAtom,
} from "@/state/atoms/commit.message";
import { useAtom } from "jotai";
import React, { useCallback } from "react";
import { CommitMessage } from "@/components/commit/core/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { getVSCodeAPI } from "@/utils/vscode";

export function CommitPage() {
  const [message, setMessage] = useAtom(commitMessageAtom);
  const [detail, setDetail] = useAtom(commitDetailAtom);
  const [files, setFiles] = useAtom(commitFilesAtom);
  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom);

  const vscode = getVSCodeAPI();

  const handleCommit = useCallback(() => {
    if (!message.trim()) {
      vscode.postMessage({
        command: "showError",
        data: "Please enter a commit message",
      });
      return;
    }

    vscode.postMessage({
      command: "commit",
      data: {
        message,
        detail,
        files,
        selectedFiles,
      },
    });
  }, [message, detail, files, selectedFiles]);

  const handleFileSelect = useCallback(
    (path: string) => {
      const newSelectedFiles = selectedFiles.includes(path)
        ? selectedFiles.filter((p) => p !== path)
        : [...selectedFiles, path];
      setSelectedFiles(newSelectedFiles);
    },
    [selectedFiles],
  );

  return (
    <div className="flex flex-col h-full gap-4 mx-auto max-w-[1080px]">
      <CommitMessage
        message={message}
        detail={detail}
        onMessageChange={setMessage}
        onDetailChange={setDetail}
        onCommit={handleCommit}
        selectedFilesCount={selectedFiles.length}
        disabled={!message.trim() || selectedFiles.length === 0}
      />

      <FileChanges onFileSelect={handleFileSelect} />

      <Footer />
    </div>
  );
}
