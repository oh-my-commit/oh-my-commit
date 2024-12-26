/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useCallback, type FC } from "react"

import { useAtom } from "jotai"

import { clientPush } from "@/clientPush"
import { Section } from "@/components/layout/Section"
import {
  diffDetailAtom,
  diffResultAtom,
  lastOpenedFilePathAtom,
  selectedFilesAtom,
} from "@/state/atoms/commit.changed-files"
import { searchQueryAtom } from "@/state/atoms/search"

import { viewModeAtom } from "@/state/atoms/ui"
import { ErrorMessage } from "../../ui/error-message"
import { FileChangesView } from "./FileChangesView"
import { ViewToggle } from "./ViewToggle"

export const FileChanges: FC = () => {
  const [diffResult] = useAtom(diffResultAtom)
  const [diffFile] = useAtom(diffDetailAtom)
  const initialSelection = diffResult?.files?.map(file => file.file) || []

  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom)
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(lastOpenedFilePathAtom)
  const [searchQuery] = useAtom(searchQueryAtom)

  console.log({ diffFile, lastOpenedFilePath })

  const handleSelect = useCallback(
    (paths: string | string[]) => {
      if (Array.isArray(paths)) {
        // 批量选择/取消选择
        const pathsSet = new Set(paths)
        const isSelectAll = paths.every(path => selectedFiles.includes(path))

        setSelectedFiles(prev => {
          if (isSelectAll) {
            // 如果所有文件都已选中，则取消选择
            return prev.filter(p => !pathsSet.has(p))
          } else {
            // 否则选择所有未选中的文件
            const newPaths = paths.filter(p => !prev.includes(p))
            return [...prev, ...newPaths]
          }
        })
      } else {
        // 单文件选择/取消选择
        setSelectedFiles(prev =>
          prev.includes(paths) ? prev.filter(p => p !== paths) : [...prev, paths],
        )
      }
    },
    [selectedFiles],
  )

  const handleFileClick = useCallback(
    (path: string) => {
      setLastOpenedFilePath(path)
      clientPush({
        type: "diff-file",
        data: { filePath: path },
      })
    },
    [setLastOpenedFilePath],
  )

  const hasSelectionChanged =
    initialSelection.length > 0 &&
    (initialSelection.length !== selectedFiles.length ||
      !initialSelection.every(file => selectedFiles.includes(file)))

  const [viewMode, setViewMode] = useAtom(viewModeAtom)

  return (
    <Section actions={<ViewToggle view={viewMode} onChange={setViewMode} />} title="Changed Files">
      {hasSelectionChanged && (
        <ErrorMessage icon={false}>
          File selection changed. You can regenerate the commit message.
        </ErrorMessage>
      )}

      <div className="flex flex-col sm:flex-row relative gap-2 h-full">
        <div className="w-full sm:max-w-[300px] flex flex-col pr-[1px] shrink-0">
          <FileChangesView
            searchQuery={searchQuery || ""}
            selectedFiles={selectedFiles}
            selectedPath={lastOpenedFilePath || undefined}
            onClick={handleFileClick}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </Section>
  )
}
