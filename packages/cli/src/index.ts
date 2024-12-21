import "reflect-metadata"

// 确保 reflect-metadata 最先导入
import {
  APP_NAME,
  CommitManager,
  ConsoleLogger,
  SETTING_MODEL_ID,
  TOKENS,
  type GenerateCommitError,
  type GenerateCommitResult,
  type IModel,
} from "@shared/common"
import { ProviderRegistry } from "@shared/server"
import chalk from "chalk"
import { program } from "commander"
import { simpleGit } from "simple-git"
import { Container } from "typedi"
import { CliConfig } from "./cli-config"

console.log(chalk.blue(APP_NAME))
// Initialize git and commit manager
const git = simpleGit()

// 1. 注册 config
Container.set(TOKENS.Config, Container.get(CliConfig))

// 2. 注册 logger 服务
Container.set(TOKENS.Logger, Container.get(ConsoleLogger))

// 3. 注册 provider registry
Container.set(TOKENS.ProviderManager, Container.get(ProviderRegistry))

// 4. 获取 CommitManager 实例
const cliCommitManager: CommitManager = Container.get(CommitManager)

// Command handlers
const listModels = async () => {
  try {
    console.log(chalk.blue("Listing models..."))
    await cliCommitManager.initProviders()
    const models = cliCommitManager.models
    console.log(chalk.blue("Available models:"))
    for (const model of models) {
      console.log(chalk.green(`  ✓ ${model.id} - ${model.name} (default)`))
    }
  } catch (error) {
    console.error(chalk.red("Failed to list models:"), error)
    process.exit(1)
  }
}

const initConfig = async () => {
  console.log(chalk.blue("Initializing Oh My Commit..."))
  try {
    // TODO: Add actual initialization logic
    // 1. Create config file if not exists
    // 2. Set up default model
    // 3. Configure git hooks if needed
    console.log(chalk.green("Initialization completed!"))
  } catch (error) {
    console.error(chalk.red("Failed to initialize:"), error)
    process.exit(1)
  }
}

const selectModel = async (modelId: string) => {
  console.log(chalk.blue(`Selecting model: ${modelId}`))
  try {
    // Initialize providers if not already done
    await cliCommitManager.initProviders()

    const availableModels: IModel[] = cliCommitManager.models
    const selectedModel = availableModels.find(m => m.id === modelId)
    if (!selectedModel) {
      console.error(chalk.red(`Model "${modelId}" not found. Use 'list' to see available models.`))
      process.exit(1)
    }

    // Set the selected model in config
    await cliCommitManager.config.update(SETTING_MODEL_ID, modelId)
    console.log(chalk.green(`Successfully set default model to: ${modelId}`))
  } catch (error) {
    console.error(chalk.red("Failed to select model:"), error)
    process.exit(1)
  }
}

const generateAndCommit = async (options: { yes?: boolean; model?: string }) => {
  console.log(chalk.blue("Generating commit message..."))
  try {
    // Initialize providers if not already done
    if (cliCommitManager.providers.length === 0) {
      await cliCommitManager.initProviders()
    }

    // If model is specified, validate and set it
    if (options.model) {
      const availableModels: IModel[] = cliCommitManager.models
      const selectedModel = availableModels.find(m => m.id === options.model)
      if (!selectedModel) {
        console.error(
          chalk.red(`Model "${options.model}" not found. Use 'list' to see available models.`),
        )
        process.exit(1)
      }
      // Set the selected model in config
      await cliCommitManager.config.update(SETTING_MODEL_ID, options.model)
    }

    const result = await cliCommitManager.generateCommit({
      changed: 0, // TODO: Parse from git diff
      files: [], // TODO: Parse from git diff
      insertions: 0, // TODO: Parse from git diff
      deletions: 0, // TODO: Parse from git diff
    })

    const commitData = result.match(
      (success: GenerateCommitResult) => success,
      (error: GenerateCommitError) => {
        throw new Error(`Error(code=${error.code}), message=${error.message}`)
      },
    )

    console.log(chalk.green("Generated commit message:"))
    console.log(commitData.title)
    if (commitData.body) {
      console.log("\n" + commitData.body)
    }

    if (options.yes) {
      // Automatically commit if -y flag is provided
      await git.commit([commitData.title, ...(commitData.body ? [commitData.body] : [])])
      console.log(chalk.green("Changes committed successfully!"))
    } else {
      // Ask for confirmation
      console.log(chalk.yellow("\nUse -y flag to commit automatically"))
      console.log(chalk.yellow("Or run git commit manually with the message above"))
    }
  } catch (error) {
    console.error(chalk.red("Failed to generate commit message:"), error)
    process.exit(1)
  }
}

// Register commands
program
  .name(APP_NAME)
  .description("Oh My Commit - AI-powered commit message generator")
  .version("1.0.0")

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
  .option(
    "-m, --model <model>",
    `Specify the AI model to use (\`omc list\` to see all available models)`,
  )
  .action(generateAndCommit)

// Show help by default
program.showHelpAfterError()
if (process.argv.length === 2) {
  program.help()
}

// Parse command line arguments
program.parse(process.argv)
