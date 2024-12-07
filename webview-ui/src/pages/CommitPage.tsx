import React from "react";
import { useAtom } from "jotai";
import { CommitForm, FileChanges, CommitActions } from "../components/commit";
import { commitStateAtom, resetFilesAtom } from "../state/atoms/commit-core";
import { getVSCodeAPI } from "../utils/vscode";

export const CommitPage: React.FC = () => {
  const [commitState] = useAtom(commitStateAtom);
  const [, resetFiles] = useAtom(resetFilesAtom);

  const handleCommit = () => {
    const vscode = getVSCodeAPI();
    vscode.postMessage({
      type: "commit",
      payload: commitState,
    });
    resetFiles();
  };

  const handleCancel = () => {
    resetFiles();
  };

  const handleFileSelect = (path: string) => {
    const vscode = getVSCodeAPI();
    vscode.postMessage({
      type: "showDiff",
      payload: { path },
    });
  };

  return (
    <div className="commit-page">
      <CommitForm onSubmit={handleCommit} />
      <FileChanges onFileSelect={handleFileSelect} />
      <CommitActions onCommit={handleCommit} onCancel={handleCancel} />
    </div>
  );
};
