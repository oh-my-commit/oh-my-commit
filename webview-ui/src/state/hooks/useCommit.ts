import { useAtom, useSetAtom } from "jotai";
import {
  commitStateAtom,
  commitMessageAtom,
  commitDetailAtom,
  commitFilesAtom,
  selectedFilesAtom,
} from "../atoms/commit-core";
import { toggleFileExpansionAtom } from "../atoms/commit-ui";
import type { CommitState } from "../types";
import type { FileChange } from "../../types/file-change";
import type { WritableAtom } from "jotai";

export function useCommit() {
  // 核心状态
  const [commitState, setCommitState] = useAtom(commitStateAtom);
  
  // UI状态
  const toggleExpanded = useSetAtom(toggleFileExpansionAtom);
  
  // 选择状态
  const [selectedFiles] = useAtom(selectedFilesAtom);
  const [, updateCommitState] = useAtom(commitStateAtom as WritableAtom<CommitState, [Partial<CommitState>], void>);

  // 核心动作
  const [, addFile] = useAtom(commitFilesAtom);
  const [, reset] = useAtom(commitStateAtom as WritableAtom<CommitState, [Partial<CommitState>], void>);

  return {
    // 核心状态
    message: commitState.message,
    detail: commitState.detail,
    files: commitState.files,
    selectedFiles,

    // 更新状态
    setMessage: (message: string) => updateCommitState({ message }),
    setDetail: (detail: string) => updateCommitState({ detail }),
    setState: (update: Partial<CommitState>) => updateCommitState(update),

    // 核心动作
    updateCommitState,
    addFile,
    reset,
    toggleExpanded,
  };
}
