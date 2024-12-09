import React from "react";
import { useAtom } from "jotai";

import { DiffViewer } from "../DiffViewer";
import { FileChangesList } from "./FileChangesList";
import { lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files";
import { Section } from "@/components/layout/Section";

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [lastOpenedFilePath] = useAtom(lastOpenedFilePathAtom);

  return (
    <Section
      title="Changed Files"
      className="text-[11px] font-medium tracking-wide text-sidebar-title"
    >
      <Section.Content>
        <div className="flex h-full">
          <div className="w-[300px] flex-none overflow-hidden flex flex-col border-r border-panel-border">
            <FileChangesList onFileSelect={onFileSelect} />
          </div>
          {!!lastOpenedFilePath && (
            <div className="flex-1 min-w-0 overflow-auto">
              <DiffViewer />
            </div>
          )}
        </div>
      </Section.Content>
    </Section>
  );
};
