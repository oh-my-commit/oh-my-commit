/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type FC, useCallback } from "react"

import { useAtom } from "jotai"

import { Section } from "@/components/layout/Section"
import { logger } from "@/lib/vscode-client-logger"
import {
  lastOpenedFilePathAtom,
  viewModeAtom,
} from "@/state/atoms/commit.changed-files"
import { searchQueryAtom } from "@/state/atoms/search"
import { clientPush } from "@/utils/clientPush"

import { FileChangesView } from "./FileChangesView"
import { ViewToggle } from "./ViewToggle"

export const FileChanges: FC = () => {
  const [lastOpenedFilePath, setLastOpenedFilePath] = useAtom(
    lastOpenedFilePathAtom
  )
  const [searchQuery] = useAtom(searchQueryAtom)
  const [viewMode, setViewMode] = useAtom(viewModeAtom)

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

  logger.info("Rendering FileChanges: ", { viewMode })

  return (
    <Section
      actions={<ViewToggle view={viewMode} onChange={setViewMode} />}
      title="Changed Files"
    >
      <div className="flex flex-col sm:flex-row relative gap-2 h-full">
        <div className="w-full sm:max-w-[300px] flex flex-col shrink-0 overflow-auto scrollbar-custom">
          <FileChangesView
            searchQuery={searchQuery || ""}
            selectedPath={lastOpenedFilePath || undefined}
            onClick={handleFileClick}
          />
        </div>
      </div>
    </Section>
  )
}
