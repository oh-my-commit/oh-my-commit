import React, { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { DiffViewer } from "../DiffViewer";
import { FileChangesList } from "./FileChangesList";
import { lastOpenedFilePathAtom } from "@/state/atoms/commit.changed-files";
import { Section } from "@/components/layout/Section";
import { InfoIcon } from "@/components/commit/info-icon";

interface FileChangesProps {
  onFileSelect?: (path: string) => void;
}

export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
  const [lastOpenedFilePath] = useAtom(lastOpenedFilePathAtom);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipContainerRef.current &&
        !tooltipContainerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Section
      title="Changed Files"
      actions={
        <div
          ref={tooltipContainerRef}
          className="relative inline-flex items-center"
        >
          <button
            className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--vscode-toolbar-hoverBackground)] text-[var(--vscode-descriptionForeground)] opacity-60 hover:opacity-100 transition-opacity duration-150"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <InfoIcon />
          </button>
          {showTooltip && (
            <div
              className="absolute right-0 top-full mt-1 z-50 min-w-[320px] p-3 rounded-sm shadow-lg bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)]"
              style={{ pointerEvents: "auto" }}
            >
              <div className="text-[11px] text-[var(--vscode-descriptionForeground)] space-y-3">
                <div>
                  <p className="font-semibold mb-1">About Changed Files</p>
                  <p>This section shows files that will be included in your commit. Each file is marked with its status:</p>
                  <ul className="ml-2 mt-1 space-y-1">
                    <li><span className="text-git-added-fg">A</span> - Added (new file)</li>
                    <li><span className="text-git-modified-fg">M</span> - Modified</li>
                    <li><span className="text-git-deleted-fg">D</span> - Deleted</li>
                    <li><span className="text-git-renamed-fg">R</span> - Renamed</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">Interactions</p>
                  <ul className="ml-2 space-y-1">
                    <li>• Click checkbox - Stage/unstage a file for commit</li>
                    <li>• Click filename - View file changes</li>
                    <li>• Cmd/Ctrl+Click - Select multiple files</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">View Options</p>
                  <ul className="ml-2 space-y-1">
                    <li>• Flat View - Shows all files in a simple list</li>
                    <li>• Grouped View - Groups files by their status</li>
                    <li>• Tree View - Shows files in their directory structure</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-1">Tips</p>
                  <ul className="ml-2 space-y-1">
                    <li>• Only staged (checked) files will be included in your commit</li>
                    <li>• Use the search bar to quickly find specific files</li>
                    <li>• Different views help organize large changesets</li>
                    <li>• Review changes carefully before committing</li>
                    <li>• Stage related changes together for cleaner commits</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      }
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
