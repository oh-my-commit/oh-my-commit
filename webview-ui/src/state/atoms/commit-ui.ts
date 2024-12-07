import { atom } from 'jotai';
import type { FileUIState } from '../types';

// 选中的文件路径
export const selectedFileAtom = atom<string | null>(null);

// 文件UI状态（展开/折叠等）
export const fileUIStatesAtom = atom<Record<string, FileUIState>>({});

// 是否显示diff预览
export const showDiffAtom = atom<boolean>(false);

// UI操作
export const toggleFileExpansionAtom = atom(
  null,
  (get, set, path: string) => {
    const states = get(fileUIStatesAtom);
    const currentState = states[path] || { path, isExpanded: false };
    set(fileUIStatesAtom, {
      ...states,
      [path]: { ...currentState, isExpanded: !currentState.isExpanded }
    });
  }
);

export const selectFileAtom = atom(
  null,
  (get, set, path: string | null) => {
    set(selectedFileAtom, path);
    set(showDiffAtom, path !== null);
  }
);
