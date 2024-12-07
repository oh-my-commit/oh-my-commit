import { atom } from 'jotai';
import { getVSCodeAPI } from '../../utils/vscode';
import type { VSCodeStorageOptions } from '../types';

export function atomWithVSCodeStorage<T>(options: VSCodeStorageOptions<T>) {
  const baseAtom = atom<T>(options.defaultValue);
  
  // 从VSCode状态中读取初始值
  const vscode = getVSCodeAPI();
  const state = vscode.getState() || {};
  if (state[options.key] !== undefined) {
    baseAtom.init = state[options.key];
  }

  return atom<T, [T], void>(
    (get) => get(baseAtom),
    (get, set, update) => {
      set(baseAtom, update);
      // 同步到VSCode状态
      const vscode = getVSCodeAPI();
      const state = vscode.getState() || {};
      vscode.setState({ ...state, [options.key]: update });
    }
  );
}

// 用于派生状态的只读原子
export function atomWithVSCodeStorageReadOnly<T>(options: VSCodeStorageOptions<T>) {
  const baseAtom = atomWithVSCodeStorage(options);
  return atom((get) => get(baseAtom));
}
