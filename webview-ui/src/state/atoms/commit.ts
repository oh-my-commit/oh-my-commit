import { atom } from 'jotai';
import { atomWithVSCodeStorage } from '../storage/vscode-storage';
import { CommitState, CommitStats } from '../types';
import { FileChange } from '@/types/file-change';

// 基础状态原子
export const commitMessageAtom = atomWithVSCodeStorage({
  key: 'yaac.commit.message',
  defaultValue: '',
});

export const commitDetailAtom = atomWithVSCodeStorage({
  key: 'yaac.commit.detail',
  defaultValue: '',
});

export const commitFilesAtom = atomWithVSCodeStorage<FileChange[]>({
  key: 'yaac.commit.files',
  defaultValue: [],
});

export const selectedFilesAtom = atomWithVSCodeStorage<string[]>({
  key: 'yaac.commit.selectedFiles',
  defaultValue: [],
});

// 派生状态
export const commitStatsAtom = atom<CommitStats>((get) => {
  const files = get(commitFilesAtom);
  const selectedFiles = get(selectedFilesAtom);

  return {
    totalFiles: files.length,
    selectedFiles: selectedFiles.length,
    additions: files.reduce((sum, file) => sum + file.additions, 0),
    deletions: files.reduce((sum, file) => sum + file.deletions, 0),
  };
});

// 组合状态
export const commitStateAtom = atom<CommitState>(
  (get) => ({
    message: get(commitMessageAtom),
    detail: get(commitDetailAtom),
    files: get(commitFilesAtom),
    selectedFiles: get(selectedFilesAtom),
  }),
  (get, set, update: Partial<CommitState>) => {
    if (update.message !== undefined) set(commitMessageAtom, update.message);
    if (update.detail !== undefined) set(commitDetailAtom, update.detail);
    if (update.files !== undefined) set(commitFilesAtom, update.files);
    if (update.selectedFiles !== undefined) set(selectedFilesAtom, update.selectedFiles);
  }
);
