/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type FC, useCallback, useEffect } from "react"

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

import { FileChangesView } from "./FileChangesView"
import { ViewToggle } from "./ViewToggle"

export const FileChanges: FC = () => {
  const [diffResult] = useAtom(diffResultAtom)
  const [diffFile] = useAtom(diffDetailAtom)
  const initialSelection = diffResult?.files?.map((file) => file.file) || []

  const [selectedFiles, setSelectedFiles] = useAtom(selectedFilesAtom)
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom
  )
  const [searchQuery] = useAtom(searchQueryAtom)

  console.log({ diffFile, lastOpenedFilePath })

  const handleSelect = useCallback(
    (paths: string | string[]) => {
      const newSelection = [...selectedFiles]

      if (Array.isArray(paths)) {
        // 批量选择/取消选择
        const pathsSet = new Set(paths)
        const isSelectAll = paths.every((path) => selectedFiles.includes(path))

        if (isSelectAll) {
          // 如果所有文件都已选中，则取消选择
          return setSelectedFiles(selectedFiles.filter((p) => !pathsSet.has(p)))
        }
        // 否则选择所有未选中的文件
        const newPaths = paths.filter((p) => !selectedFiles.includes(p))
        return setSelectedFiles([...selectedFiles, ...newPaths])
      }

      // 单文件选择/取消选择
      if (selectedFiles.includes(paths)) {
        return setSelectedFiles(selectedFiles.filter((p) => p !== paths))
      }
      return setSelectedFiles([...selectedFiles, paths])
    },
    [selectedFiles]
  )

  const handleFileClick = useCallback(
    (path: string) => {
      setLastOpenedFilePath(path)
      clientPush({
        type: "diff-file",
        data: { filePath: path },
      })
    },
    [setLastOpenedFilePath]
  )

  const hasSelectionChanged =
    initialSelection.length > 0 &&
    (initialSelection.length !== selectedFiles.length ||
      !initialSelection.every((file) => selectedFiles.includes(file)))

  const [viewMode, setViewMode] = useAtom(viewModeAtom)

  useEffect(() => {
    if (hasSelectionChanged) {
      clientPush({
        type: "show-info",
        data: {
          message:
            "File selection changed. You can regenerate the commit message.",
        },
      })
    }
  }, [hasSelectionChanged])

  return (
    <Section
      actions={<ViewToggle view={viewMode} onChange={setViewMode} />}
      title="Changed Files"
    >
      <div className="flex flex-col sm:flex-row relative gap-2 h-full">
        <div className="w-full sm:max-w-[300px] flex flex-col shrink-0 overflow-auto scrollbar-custom">
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
