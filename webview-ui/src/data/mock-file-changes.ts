// Mock data for file changes
export const mockFileChanges = [
    {
        path: "src/services/commit-service.ts",
        status: "M",
        additions: 25,
        deletions: 12,
        diff: `@@ -15,7 +15,7 @@ export class CommitService {
  private readonly git: SimpleGit;
  
  constructor(
-   private readonly context: vscode.ExtensionContext,
+   context: vscode.ExtensionContext,
    private readonly outputChannel: vscode.OutputChannel
  ) {
    this.git = simpleGit();
@@ -42,9 +42,13 @@ export class CommitService {
-   async getCommitMessage(): Promise<string> {
+   async generateCommitMessage(): Promise<string> {
      // Implementation
    }
  }`,
    },
    {
        path: "src/webview/CommitMessage.tsx",
        status: "M",
        additions: 156,
        deletions: 89,
        diff: `@@ -1,6 +1,6 @@
  import React from "react";
- import { vsCodeButton } from "@vscode/webview-ui-toolkit";
+ import { vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";
  
  export const CommitMessage = () => {
    // Implementation
  }`,
    },
    {
        path: "src/webview/styles/commit.css",
        status: "A",
        additions: 145,
        deletions: 0,
        diff: `@@ -0,0 +1,145 @@
+ .commit-container {
+   display: flex;
+   flex-direction: column;
+   height: 100vh;
+ }
+ 
+ .commit-form {
+   flex: 1;
+   padding: 16px;
+ }`,
    },
    {
        path: "src/core/git.core.ts",
        status: "M",
        additions: 8,
        deletions: 3,
        diff: `@@ -23,7 +23,7 @@ export class GitCore {
    private readonly workspaceRoot: string;
  
-   constructor(context: vscode.ExtensionContext) {
+   constructor(workspaceRoot: string) {
      this.workspaceRoot = workspaceRoot;
    }
  }`,
    },
    {
        path: "src/test/commit-service.test.ts",
        status: "A",
        additions: 67,
        deletions: 0,
        diff: `@@ -0,0 +1,67 @@
+ import { CommitService } from "../services/commit-service";
+ 
+ describe("CommitService", () => {
+   test("should generate commit message", async () => {
+     // Test implementation
+   });
+ });`,
    },
    {
        path: "package.json",
        status: "M",
        additions: 3,
        deletions: 1,
        diff: `@@ -9,6 +9,8 @@
    "dependencies": {
      "@vscode/webview-ui-toolkit": "^1.2.0",
+     "simple-git": "^3.19.0",
+     "typescript": "^5.0.4"
    }`,
    },
]; // Mock data for recent commits