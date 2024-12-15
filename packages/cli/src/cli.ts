#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import path from "path";
import simpleGit from "simple-git";
import { CommitManager } from "@oh-my-commit/core";
import { GitChangeSummary } from "@oh-my-commit/shared/types/git";

// Initialize git and commit manager
const git = simpleGit();
const commitManager = new CommitManager();

// Command handlers
const handlers = {
  commit: async (options: any) => {
    // Default command (omc)
    console.log(chalk.blue("Generating commit message..."));
    try {
      const diff = await git.diff(["--staged"]);
      const result = await commitManager.generateCommit({
        changed: 0, // TODO: Parse from git diff
        files: [], // TODO: Parse from git diff
        insertions: 0, // TODO: Parse from git diff
        deletions: 0, // TODO: Parse from git diff
      });

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
      const diff = await git.diff(["--staged"]);
      const result = await commitManager.generateCommit({
        changed: 0, // TODO: Parse from git diff
        files: [], // TODO: Parse from git diff
        insertions: 0, // TODO: Parse from git diff
        deletions: 0, // TODO: Parse from git diff
      });

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

  check: async (options: any) => {
    console.log(chalk.blue("Checking commit message..."));
    // Add your check logic here
  },

  conventional: async (options: any) => {
    console.log(chalk.blue("Switching to conventional mode..."));
    // Add your conventional mode logic here
  },

  simple: async (options: any) => {
    console.log(chalk.blue("Switching to simple mode..."));
    // Add your simple mode logic here
  },

  english: async (options: any) => {
    console.log(chalk.blue("Switching to English..."));
    // Add your English mode logic here
  },

  chinese: async (options: any) => {
    console.log(chalk.blue("Switching to Chinese..."));
    // Add your Chinese mode logic here
  },

  team: async (options: any) => {
    console.log(chalk.blue("Switching to team mode..."));
    // Add your team mode logic here
  },

  teamInit: async (options: any) => {
    console.log(chalk.blue("Initializing team configuration..."));
    // Add your team init logic here
  },

  teamCheck: async (options: any) => {
    console.log(chalk.blue("Checking team configuration..."));
    // Add your team check logic here
  },

  debug: async (options: any) => {
    console.log(chalk.blue("Running in debug mode..."));
    // Add your debug logic here
  },
};

// Get command from process name
const getCommand = () => {
  const processName = path.basename(process.argv[1]);
  switch (processName) {
    case "omc-init":
      return "init";
    case "omc-gen":
      return "generate";
    case "omc-check":
      return "check";
    case "omc-conventional":
      return "conventional";
    case "omc-simple":
      return "simple";
    case "omc-en":
      return "english";
    case "omc-zh":
      return "chinese";
    case "omc-team":
      return "team";
    case "omc-team-init":
      return "teamInit";
    case "omc-team-check":
      return "teamCheck";
    case "omc-debug":
      return "debug";
    default:
      return "commit";
  }
};

// Common options
const addCommonOptions = (cmd: any) => {
  return cmd
    .option("--mode <mode>", "specify mode")
    .option("--lang <language>", "specify language")
    .option("--team", "use team mode")
    .option("--debug", "enable debug mode");
};

// Main program
program.version("1.0.0").description("Oh My Commit CLI");

// Add all commands
program
  .command("commit")
  .description("Generate and execute commit (default)")
  .option("-d, --dry-run", "Preview the commit message without actually committing")
  .action(handlers.commit);

program
  .command("init")
  .description("Initialize Oh My Commit")
  .action(handlers.init);

program
  .command("generate")
  .description("Generate commit message")
  .action(handlers.generate);

program
  .command("check")
  .description("Check commit message")
  .action(handlers.check);

program
  .command("conventional")
  .description("Use conventional mode")
  .action(handlers.conventional);

program
  .command("simple")
  .description("Use simple mode")
  .action(handlers.simple);

program.command("english").description("Use English").action(handlers.english);

program.command("chinese").description("Use Chinese").action(handlers.chinese);

program.command("team").description("Use team mode").action(handlers.team);

program
  .command("team-init")
  .description("Initialize team configuration")
  .action(handlers.teamInit);

program
  .command("team-check")
  .description("Check team configuration")
  .action(handlers.teamCheck);

program
  .command("debug")
  .description("Run in debug mode")
  .action(handlers.debug);

// Add common options to all commands
program.commands.forEach((cmd) => {
  addCommonOptions(cmd);
});

// Execute the command based on process name
const command = getCommand();
if (command !== "commit") {
  // For specific commands (omc-*), directly execute the handler
  handlers[command as keyof typeof handlers](program.opts());
} else {
  // For default command (omc), parse arguments normally
  program.parse(process.argv);
}

process.on("unhandledRejection", (err) => {
  console.error(chalk.red("Error:"), err);
  process.exit(1);
});
