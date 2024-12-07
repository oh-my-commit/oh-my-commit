import type { FileChange } from "../state/types";

export const mockFileChanges: FileChange[] = [
  {
    path: "src/components/commit/CommitForm.tsx",
    type: "modified",
    status: "modified",
    additions: 15,
    deletions: 8,
    diff: `@@ -1,6 +1,8 @@
 import React from 'react';
 import { useAtom } from 'jotai';
-import { commitState } from '../state/atoms';
+import { commitMessageAtom, commitDetailAtom } from '../../state/atoms/commit-core';
+import type { CommitState } from '../../state/types';
 
 interface CommitFormProps {
   onSubmit?: () => void;
@@ -15,7 +17,7 @@ export const CommitForm: React.FC<CommitFormProps> = ({ onSubmit }) => {
   return (
     <form onSubmit={handleSubmit} className="commit-form">
       <div className="commit-input-section">
-        <div className="header">
+        <div className="section-header">
           <div className="section-title">
             Commit Message
             <span className="ai-badge">AI</span>`,
  },
  {
    path: "src/components/commit/FileChanges.tsx",
    type: "added",
    status: "added",
    additions: 73,
    deletions: 0,
    diff: `@@ -0,0 +1,73 @@
+import React from 'react';
+import { useAtom } from 'jotai';
+import { commitFilesAtom, commitStatsAtom } from '../../state/atoms/commit-core';
+import { selectFileAtom, selectedFileAtom, showDiffAtom } from '../../state/atoms/commit-ui';
+import { DiffViewer } from './DiffViewer';
+import type { FileChange } from '../../state/types';
+
+interface FileChangesProps {
+  onFileSelect?: (path: string) => void;
+}
+
+export const FileChanges: React.FC<FileChangesProps> = ({ onFileSelect }) => {
+  const [files] = useAtom(commitFilesAtom);
+  const [stats] = useAtom(commitStatsAtom);
+  const [selectedPath] = useAtom(selectedFileAtom);
+  const [showDiff] = useAtom(showDiffAtom);
+  const [, selectFile] = useAtom(selectFileAtom);`,
  },
  {
    path: "src/state/atoms/commit-core.ts",
    type: "modified",
    status: "modified",
    additions: 42,
    deletions: 35,
    diff: `@@ -1,35 +1,42 @@
-import { atom } from 'jotai';
-import { atomWithStorage } from 'jotai/utils';
-import type { CommitState } from '../types';
+import { atom } from "jotai";
+import type { FileChange, CommitState, CommitStats } from "../types";
 
-// 基础状态
-export const commitMessageAtom = atomWithStorage('commit.message', '');
-export const commitDetailAtom = atomWithStorage('commit.detail', '');
-export const commitFilesAtom = atomWithStorage('commit.files', []);
+// 核心状态原子
+export const commitMessageAtom = atom<string>("");
+export const commitDetailAtom = atom<string>("");
+export const commitFilesAtom = atom<FileChange[]>([]);
+export const selectedFilesAtom = atom<string[]>([]);`,
  },
  {
    path: "src/state/types.ts",
    type: "modified",
    status: "modified",
    additions: 12,
    deletions: 6,
    diff: `@@ -1,6 +1,12 @@
-export interface CommitState {
-  message: string;
-  detail: string;
-  files: any[];
+// 核心业务类型
+export interface FileChange {
+  path: string;
+  status: 'added' | 'modified' | 'deleted';
+  additions: number;
+  deletions: number;
+  content?: string;
+  diff?: string;
 }
 
-export type FileStatus = 'added' | 'modified' | 'deleted';`,
  },
  {
    path: "src/utils/vscode.ts",
    type: "deleted",
    status: "deleted",
    additions: 0,
    deletions: 15,
    diff: `@@ -1,15 +0,0 @@
-import { VSCodeAPI } from '../types';
-
-// 获取VSCode API实例
-export const vscode = (() => {
-  let api: VSCodeAPI;
-  try {
-    api = window.acquireVsCodeApi();
-  } catch (err) {
-    api = {
-      getState: () => null,
-      setState: () => {},
-      postMessage: () => {},
-    };
-  }
-  return api;
-})();`,
  },
];
