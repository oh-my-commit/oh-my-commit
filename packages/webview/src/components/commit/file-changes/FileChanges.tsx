/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-26
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, type FC } from "react"

import { useAtom } from "jotai"

import { Section } from "@/components/layout/Section"
import { cn } from "@/lib/utils"
import {
  diffResultAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files"
import { searchQueryAtom } from "@/state/atoms/search"
import { viewModeAtom } from "@/state/atoms/ui"
import { ErrorMessage } from "../../ui/error-message"

import { DiffViewer } from "./DiffViewer"
import { EmptyState } from "./EmptyState"
import { FlatView } from "./FlatView"
import { SearchBar } from "./SearchBar"

export const FileChanges: FC = () => {
  const [diffResult, setDiffResult] = useAtom(diffResultAtom)
  const initialSelection = diffResult?.files?.map(file => file.file) || []

  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom)
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(lastOpenedFilePathAtom)
  const [viewMode] = useAtom(viewModeAtom)
  const [searchQuery] = useAtom(searchQueryAtom)

  const handleSelect = useCallback(
    (path: string) => {
      setSelectedFiles(
        selectedFiles.includes(path)
          ? selectedFiles.filter(p => p !== path)
          : [...selectedFiles, path],
      )
    },
    [selectedFiles],
  )

  const hasSelectionChanged =
    initialSelection.length > 0 &&
    (initialSelection.length !== selectedFiles.length ||
      !initialSelection.every(file => selectedFiles.includes(file)))

  const handleClick = (path: string) => {
    setLastOpenedFilePath(path)
  }

  const renderFileView = () => {
    if (!diffResult?.files?.length) {
      return <EmptyState />
    }

    switch (viewMode) {
      case "flat":
        return (
          <FlatView
            searchQuery={searchQuery || ""}
            selectedFiles={selectedFiles}
            selectedPath={lastOpenedFilePath || undefined}
            onClick={handleClick}
            onSelect={handleSelect}
          />
        )
      case "tree":
        return "todo"
      default:
        return null
    }
  }

  return (
    <Section title="Changed Files">
      {hasSelectionChanged && (
        <ErrorMessage icon={false}>
          File selection changed. You can regenerate the commit message.
        </ErrorMessage>
      )}

      <div className="flex flex-col sm:flex-row relative gap-2 h-full">
        <div className="w-full sm:max-w-[300px] flex flex-col pr-[1px] shrink-0">
          <div className="flex items-center gap-2 mb-2 w-full z-10 py-1">
            <SearchBar />
          </div>
          <div className="overflow-y-auto vscode-scrollbar">{renderFileView()}</div>
        </div>

        <div
          className={cn(
            "flex-1 border-l border-[var(--vscode-panel-border)] pl-3 transition-all duration-200 ease-in-out overflow-auto",
            !lastOpenedFilePath && "opacity-0",
          )}
        >
          {lastOpenedFilePath && (
            <div className="h-full">
              <DiffViewer />
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}
