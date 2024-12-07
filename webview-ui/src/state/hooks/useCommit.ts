import { useAtom, useSetAtom } from "jotai";
import {
  commitStateAtom,
  commitMessageAtom,
  commitDetailAtom,
  commitFilesAtom,
  selectedFilesAtom,
  updateCommitStateAtom,
} from "../atoms/commit-core";
import { toggleFileExpansionAtom } from "../atoms/commit-ui";
import type { CommitState } from "../types";
import type { FileChange } from "../../types/file-change";

export function useCommit() {
  // 核心状态
  const [commitState] = useAtom(commitStateAtom);
  const [selectedFiles] = useAtom(selectedFilesAtom);
  
  // UI状态
  const toggleExpanded = useSetAtom(toggleFileExpansionAtom);
  
  // 更新动作
  const [, updateCommit] = useAtom(updateCommitStateAtom);

  return {
    // 核心状态
    message: commitState.message,
    detail: commitState.detail,
    files: commitState.files,
    selectedFiles,

    // 更新状态
    setMessage: (message: string) => updateCommit({ message }),
    setDetail: (detail: string) => updateCommit({ detail }),
    setState: (update: Partial<CommitState>) => updateCommit(update),

    // UI动作
    toggleExpanded,
  };
}
