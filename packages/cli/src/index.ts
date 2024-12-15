#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import path from "path";
import simpleGit from "simple-git";
import { CommitManager } from "@oh-my-commit/shared";
import type { GitChangeSummary } from "@oh-my-commit/shared";

// Initialize git and commit manager
const git = simpleGit();
const commitManager = new CommitManager();

// Session record
const sessionRecord = {
  meta: {
    id: "039",
    slug: "typescript_compilation",
    title: "TypeScript Compilation Errors",
    abstract: "Fixing TypeScript compilation errors across multiple packages",
    status: { state: "completed" },
  },
  current: {
    time: "2024-12-15T15:21:03+08:00",
    round: 1,
    duration: 300,
  },
  changes: {
    files: [
      "packages/shared/src/index.ts",
      "packages/cli/src/cli.ts",
      "packages/extension/src/providers/oh-my-commit.ts",
      "packages/core/tsconfig.json",
    ],
  },
  summary: {
    fixed_issues: [
      "修复了类型导出问题，使用 export type 语法",
      "解决了 GitChangeSummary 重复导入的问题",
      "清理了未使用的导入和接口",
      "创建了缺失的 core 包 tsconfig.json 文件",
    ],
  },
};

// Command handlers
const handlers = {
  commit: async (options: any) => {
    // Default command (omc)
    console.log(chalk.blue("Generating commit message..."));
    try {
      if (!options.model) {
        const models = await commitManager.getAvailableModels();
        console.error(chalk.red("Error: No model specified. Use --model or -m to specify a model."));
        console.log(chalk.yellow("\nAvailable models:"));
        for (const model of models) {
          console.log(`  - ${model.id} (${model.name})`);
        }
        process.exit(1);
      }

      const diff = await git.diff(["--staged"]);
      const result = await commitManager.generateCommit({
        changed: 0, // TODO: Parse from git diff
        files: [], // TODO: Parse from git diff
        insertions: 0, // TODO: Parse from git diff
        deletions: 0, // TODO: Parse from git diff
      }, options.model);

      if (result.isOk()) {
        const commitData = result.value;
        console.log(chalk.green("Generated commit message:"));
        console.log(commitData.title);
        if (commitData.body) {
          console.log("\n" + commitData.body);
        }

        if (!options.dryRun) {
          // Execute git commit only if not in dry-run mode
          await git.commit([commitData.title, ...(commitData.body ? [commitData.body] : [])]);
          console.log(chalk.green("Changes committed successfully!"));
        } else {
          console.log(chalk.yellow("\nDry run mode - changes were not committed."));
          console.log(chalk.yellow("To commit these changes, run the command without --dry-run"));
        }
      } else {
        console.error(chalk.red("Failed to generate commit message:"), result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("Failed to commit changes:"), error);
      process.exit(1);
    }
  },

  init: async (options: any) => {
    console.log(chalk.blue("Initializing Oh My Commit..."));
    // Add your init logic here
  },

  generate: async (options: any) => {
    console.log(chalk.blue("Generating commit message..."));
    try {
      if (!options.model) {
        const models = await commitManager.getAvailableModels();
        console.error(chalk.red("Error: No model specified. Use --model or -m to specify a model."));
        console.log(chalk.yellow("\nAvailable models:"));
        for (const model of models) {
          console.log(`  - ${model.id} (${model.name})`);
        }
        process.exit(1);
      }

      const diff = await git.diff(["--staged"]);
      const result = await commitManager.generateCommit({
        changed: 0, // TODO: Parse from git diff
        files: [], // TODO: Parse from git diff
        insertions: 0, // TODO: Parse from git diff
        deletions: 0, // TODO: Parse from git diff
      }, options.model);

      if (result.isOk()) {
        const commitData = result.value;
        console.log(chalk.green("Generated commit message:"));
        console.log(commitData.title);
        if (commitData.body) {
          console.log("\n" + commitData.body);
        }
      } else {
        console.error(chalk.red("Failed to generate commit message:"), result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("Failed to generate commit message:"), error);
      process.exit(1);
    }
  },
};

// Register commands
program
  .name("omc")
  .description("Oh My Commit - AI-powered commit message generator")
  .version("1.0.0");

program
  .command("commit")
  .description("Generate and commit changes with AI-generated message")
  .option("-d, --dry-run", "Preview the commit message without actually committing")
  .option("-m, --model <model>", "Specify the AI model to use (e.g., oh-my-commit/standard)")
  .action(handlers.commit);

program
  .command("init")
  .description("Initialize Oh My Commit configuration")
  .action(handlers.init);

program
  .command("generate")
  .description("Generate commit message without committing")
  .option("-m, --model <model>", "Specify the AI model to use (e.g., oh-my-commit/standard)")
  .action(handlers.generate);

// Parse command line arguments
program.parse(process.argv);
