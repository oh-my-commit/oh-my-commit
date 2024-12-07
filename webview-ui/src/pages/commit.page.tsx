import { useAtom } from "jotai";
import React from "react";
import { CommitForm, FileChanges } from "../components/commit";
import { commitStateAtom, resetFilesAtom } from "../state/atoms/commit-core";
import { getVSCodeAPI } from "../utils/vscode";
import { Footer } from "../components/footer";
import "./commit-page.css";

export const CommitPage: React.FC = () => {
  const [commitState] = useAtom(commitStateAtom);
  const [, resetFiles] = useAtom(resetFilesAtom);
  const vscode = getVSCodeAPI();

  const handleCommit = () => {
    vscode.postMessage({
      command: "commit",
      data: {
        message: commitState.message,
        detail: commitState.detail,
        files: commitState.files,
      },
    });
  };

  const handleFileSelect = (path: string) => {
    vscode.postMessage({
      command: "showDiff",
      data: { path },
    });
  };

  return (
    <div className="commit-page">
      <CommitForm onSubmit={handleCommit} />
      <FileChanges onFileSelect={handleFileSelect} />
      <Footer />
    </div>
  );
};
