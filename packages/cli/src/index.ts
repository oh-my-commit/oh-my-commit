/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import "reflect-metadata"

import chalk from "chalk"
import { program } from "commander"

import {
  APP_NAME,
  CommitManager,
  ConsoleLogger,
  IInputOptions,
  type IModel,
  type IResult,
  Inject,
  SETTING_MODEL_ID,
} from "@shared/common"
import { CliPreference, GitCommitManager, GitCore, ProviderRegistry, TOKENS } from "@shared/server"

import { displayBanner } from "@/utils"

import packageJson from "../package.json"

const logger = Inject(TOKENS.Logger, ConsoleLogger)
const config = Inject(TOKENS.Preference, CliPreference)
const providerManager = Inject(TOKENS.ProviderManager, ProviderRegistry)
const git = Inject(TOKENS.GitManager, GitCore)
const commitManager = Inject(TOKENS.CommitManager, CommitManager)
const gitCommitManager = Inject(TOKENS.GitCommitManager, GitCommitManager)

// Command handlers
const listModels = async () => {
  try {
    logger.info(chalk.blue("Listing models..."))
    await providerManager.initialize()
    const models = commitManager.models
    logger.info(chalk.blue("Available models:"))
    for (const model of models) {
      logger.info(chalk.green(`  ✓ ${model.id} - ${model.name} (default)`))
    }
  } catch (error) {
    logger.error(chalk.red("Failed to list models:"), error)
    process.exit(1)
  }
}

const initConfig = async () => {
  logger.info(chalk.blue("Initializing Oh My Commit..."))
  try {
    // TODO: Add actual initialization logic
    // 1. Create config file if not exists
    // 2. Set up default model
    // 3. Configure git hooks if needed
    logger.info(chalk.green("Initialization completed!"))
  } catch (error) {
    logger.error(chalk.red("Failed to initialize:"), error)
    process.exit(1)
  }
}

const selectModel = async (modelId: string) => {
  logger.info(chalk.blue(`Selecting model: ${modelId}`))
  try {
    // Initialize providers if not already done
    await providerManager.initialize()

    const availableModels: IModel[] = commitManager.models
    const selectedModel = availableModels.find((m) => m.id === modelId)
    if (!selectedModel) {
      logger.error(chalk.red(`Model "${modelId}" not found. Use 'list' to see available models.`))
      process.exit(1)
    }

    // Set the selected model in config
    await config.update(SETTING_MODEL_ID, modelId)
    logger.info(chalk.green(`Successfully set default model to: ${modelId}`))
  } catch (error) {
    logger.error(chalk.red("Failed to select model:"), error)
    process.exit(1)
  }
}

const generateAndCommit = async (options: IInputOptions & { yes?: boolean }) => {
  logger.info(chalk.blue("Generating commit message..."))
  try {
    // Initialize providers if not already done
    if (providerManager.providers.length === 0) {
      await providerManager.initialize()
    }
    // todo: init lang
    const result = await gitCommitManager.generateCommit()

    if (!result.ok) {
      logger.error(chalk.red(`Failed to generate commit message, reason: ${result.message}`))
      process.exit(1)
    }

    const commitData: IResult = result.data

    logger.info(chalk.green([`Generated commit message:`, commitData.title, `---`, commitData.body].join("\n")))

    if (options.yes) {
      // Automatically commit if -y flag is provided
      await git.commit([commitData.title, ...(commitData.body ? [commitData.body] : [])].join("\n"))
      logger.info(chalk.green("Changes committed successfully!"))
    } else {
      // Ask for confirmation
      logger.info(
        chalk.yellow("\nUse -y flag to commit automatically, or run git commit manually with the message above")
      )
    }
  } catch (error) {
    logger.error(chalk.red("Failed to generate commit message:"), error)
    process.exit(1)
  }
}

program
  .name(APP_NAME)
  .description("Oh My Commit - AI-powered commit message generator")
  .version(packageJson?.version ?? "0.0.0", "-v, -V, --version")
  .helpOption("-h, -H, --help")
  .showHelpAfterError(true)

// Init command
program.command("init").description("Initialize Oh My Commit configuration").action(initConfig)

// List models command
program.command("list-models").description("List all available AI Commit models").action(listModels)

// Select model command
program
  .command("select-model <modelId>")
  .description("Set the default model to use for commit generation")
  .action(selectModel)

// Generate command
program
  .command("gen")
  .description("Generate commit message")
  .option("-y, --yes", "Automatically commit changes")
  .option("-m, --model <model>", `Specify the AI model to use (\`omc list\` to see all available models)`)
  .action(generateAndCommit)

if (process.argv.length === 2) {
  displayBanner()
  program.outputHelp()
  process.exit(1)
}

// Parse command line arguments
program.parse(process.argv)
