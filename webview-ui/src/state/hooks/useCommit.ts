import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { FileChange, CommitState } from '../types';
import {
  commitStateAtom,
  commitStatsAtom,
  addChangeAtom,
  removeChangeAtom,
  resetCommitAtom,
} from '../atoms/commit-core';
import {
  fileUIStatesAtom,
  toggleFileExpandedAtom,
} from '../atoms/commit-ui';
import {
  fileSelectionAtom,
  toggleFileSelectionAtom,
  generateCommitMessageAtom,
} from '../atoms/commit-selection';

export function useCommit() {
  // 核心状态
  const [commitState, setCommitState] = useAtom(commitStateAtom);
  const stats = useAtomValue(commitStatsAtom);
  
  // UI状态
  const [uiStates] = useAtom(fileUIStatesAtom);
  const toggleExpanded = useSetAtom(toggleFileExpandedAtom);
  
  // 选择状态
  const [selectionState] = useAtom(fileSelectionAtom);
  const toggleSelection = useSetAtom(toggleFileSelectionAtom);
  const generateCommitMessage = useSetAtom(generateCommitMessageAtom);

  // 核心动作
  const addChange = useSetAtom(addChangeAtom);
  const removeChange = useSetAtom(removeChangeAtom);
  const reset = useSetAtom(resetCommitAtom);

  return {
    // 核心状态
    ...commitState,
    stats,
    
    // UI状态
    uiStates,
    toggleExpanded,
    
    // 选择状态
    selectedPaths: selectionState.selectedPaths,
    toggleSelection,
    
    // 更新提交状态
    setMessage: (message: string) => setCommitState({ message }),
    setDetail: (detail: string) => setCommitState({ detail }),
    setChanges: (changes: FileChange[]) => setCommitState({ changes }),
    setState: (update: Partial<CommitState>) => setCommitState(update),

    // 文件操作
    addChange,
    removeChange,
    
    // 自动生成
    generateCommitMessage,

    // 重置
    reset,
  };
}
