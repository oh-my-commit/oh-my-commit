import { CommitMessage } from "@/components/commit/core/CommitMessage";
import { FileChanges } from "@/components/commit/file-changes/FileChanges";
import { Footer } from "@/components/footer";
import { useCloseWindow } from "@/hooks/use-close-window";
import { changedFilesAtom } from "@/state/atoms/commit.changed-files";
import { commitBodyAtom, commitTitleAtom } from "@/state/atoms/commit.message";
import { CommitEvent } from "@yaac/shared/types/commit";
import { useSetAtom } from "jotai";
import React, { useEffect } from "react";

export function CommitPage() {
  const setTitle = useSetAtom(commitTitleAtom);
  const setBody = useSetAtom(commitBodyAtom);
  const setChangedFiles = useSetAtom(changedFilesAtom);

  useCloseWindow();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "git-changes":
          break;

        case "commit":
          const data = message.data as CommitEvent;
          if (data.message.isOk()) {
            setTitle(data.message.value.title); // Clear commit message after successful commit
            setBody(data.message.value.body ?? ""); // Clear commit detail
            setChangedFiles(data.diffSummary); // Update changed files with new diff summary
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto">
        <CommitMessage />
        <FileChanges />
      </div>
      <Footer />
    </div>
  );
}
