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
import figlet from "figlet"
import { readFileSync } from "fs"
import path, { resolve } from "path"
import { Container } from "typedi"

import {
  APP_NAME,
  CommitManager,
  ConsoleLogger,
  type IModel,
  type IResult,
  SETTING_MODEL_ID,
  TOKENS,
} from "@shared/common"
import { GitCore, ProviderRegistry } from "@shared/server"

import packageJson from "../package.json"
import { CliConfig } from "./config"

const displayBanner = () => {
  // 使用默认字体，避免复杂的字体加载逻辑
  console.log(
    chalk.cyan(
      figlet.textSync("Oh My Commit", {
        horizontalLayout: "default",
      })
    )
  )
  console.log(
    chalk.gray(
      "✨ AI-powered commit message generator\n" +
        `📦 Version ${packageJson.version}\n`
    )
  )
}

Container.set(TOKENS.Config, Container.get(CliConfig))
Container.set(TOKENS.Logger, Container.get(ConsoleLogger))
Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))
const git = Container.get(GitCore)

const commitManager: CommitManager = Container.get(CommitManager)

// Command handlers
const listModels = async () => {
  try {
    commitManager.logger.info(chalk.blue("Listing models..."))
    await commitManager.providerManager.initialize()
    const models = commitManager.models
    commitManager.logger.info(chalk.blue("Available models:"))
    for (const model of models) {
      commitManager.logger.info(
        chalk.green(`  ✓ ${model.id} - ${model.name} (default)`)
      )
    }
  } catch (error) {
    console.error(chalk.red("Failed to list models:"), error)
    process.exit(1)
  }
}

const initConfig = async () => {
  commitManager.logger.info(chalk.blue("Initializing Oh My Commit..."))
  try {
    // TODO: Add actual initialization logic
    // 1. Create config file if not exists
    // 2. Set up default model
    // 3. Configure git hooks if needed
    commitManager.logger.info(chalk.green("Initialization completed!"))
  } catch (error) {
    console.error(chalk.red("Failed to initialize:"), error)
    process.exit(1)
  }
}

const selectModel = async (modelId: string) => {
  commitManager.logger.info(chalk.blue(`Selecting model: ${modelId}`))
  try {
    // Initialize providers if not already done
    await commitManager.providerManager.initialize()

    const availableModels: IModel[] = commitManager.models
    const selectedModel = availableModels.find((m) => m.id === modelId)
    if (!selectedModel) {
      console.error(
        chalk.red(
          `Model "${modelId}" not found. Use 'list' to see available models.`
        )
      )
      process.exit(1)
    }

    // Set the selected model in config
    await commitManager.config.update(SETTING_MODEL_ID, modelId)
    commitManager.logger.info(
      chalk.green(`Successfully set default model to: ${modelId}`)
    )
  } catch (error) {
    console.error(chalk.red("Failed to select model:"), error)
    process.exit(1)
  }
}

const generateAndCommit = async (options: {
  yes?: boolean
  model?: string
}) => {
  commitManager.logger.info(chalk.blue("Generating commit message..."))
  try {
    // Initialize providers if not already done
    if (commitManager.providers.length === 0) {
      await commitManager.providerManager.initialize()
    }

    // If model is specified, validate and set it
    if (options.model) {
      const availableModels: IModel[] = commitManager.models
      const selectedModel = availableModels.find((m) => m.id === options.model)
      if (!selectedModel) {
        console.error(
          chalk.red(
            `Model "${options.model}" not found. Use 'list' to see available models.`
          )
        )
        process.exit(1)
      }
      // Set the selected model in config
      await commitManager.config.update(SETTING_MODEL_ID, options.model)
    }

    const diff = await git.getDiffResult()
    // todo: init lang
    const result = await commitManager.generateCommit(diff, { lang: "en" })

    if (!result.ok) {
      commitManager.logger.error(
        chalk.red("Failed to generate commit message:")
      )
      commitManager.logger.error(result.message)
      process.exit(1)
    }

    const commitData: IResult = result.data

    commitManager.logger.info(
      chalk.green(
        [
          `Generated commit message:`,
          commitData.title,
          `---`,
          commitData.body,
        ].join("\n")
      )
    )

    if (options.yes) {
      // Automatically commit if -y flag is provided
      await git.commit(
        [commitData.title, ...(commitData.body ? [commitData.body] : [])].join(
          "\n"
        )
      )
      commitManager.logger.info(chalk.green("Changes committed successfully!"))
    } else {
      // Ask for confirmation
      commitManager.logger.info(
        chalk.yellow("\nUse -y flag to commit automatically")
      )
      commitManager.logger.info(
        chalk.yellow("Or run git commit manually with the message above")
      )
    }
  } catch (error) {
    console.error(chalk.red("Failed to generate commit message:"), error)
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
program
  .command("init")
  .description("Initialize Oh My Commit configuration")
  .action(initConfig)

// List models command
program
  .command("list-models")
  .description("List all available AI Commit models")
  .action(listModels)

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
  .option(
    "-m, --model <model>",
    `Specify the AI model to use (\`omc list\` to see all available models)`
  )
  .action(generateAndCommit)

if (process.argv.length === 2) {
  displayBanner()
  program.outputHelp()
  process.exit(1)
}

// Parse command line arguments
program.parse(process.argv)
