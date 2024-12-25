import "reflect-metadata"

import type { CommitFunctions } from "@changesets/types"
import { CommitManager, ConsoleLogger, TOKENS, type IResult } from "@shared/common"
import chalk from "chalk"
import { Container } from "typedi"

import { CliConfig } from "@cli/config"

// 初始化依赖注入
Container.set(TOKENS.Config, Container.get(CliConfig))
Container.set(TOKENS.Logger, Container.get(ConsoleLogger))

const commitManager: CommitManager = Container.get(CommitManager)

/**
 * 生成用于 changesets 的提交信息
 * @returns CommitFunctions 包含 getAddMessage 和 getVersionMessage 的函数对象
 */
const getCommitFunctions = (): CommitFunctions => {
  return {
    getAddMessage: async ({ releases, summary }) => {
      try {
        // 初始化 providers
        if (commitManager.providers.length === 0) {
          await commitManager.providersManager.initialize()
        }

        // const result = await commitManager.generateCommit({
        //   changed: 1,
        //   files: [],
        //   insertions: 0,
        //   deletions: 0,
        // })

        // if (!result.ok) {
        //   commitManager.logger.error(chalk.red("Failed to generate changeset commit message:"))
        //   commitManager.logger.error(result.message)
        //   return `chore: update changeset for ${releases.length} release(s)`
        // }

        // const commitData: IResult = result.data

        const commitData: IResult = { title: "todo: getCommitFunctions", body: "..." }
        return [commitData.title, ...(commitData.body ? [commitData.body] : [])].join("\n")
      } catch (error) {
        console.error(chalk.red("Failed to generate changeset commit message:"), error)
        return `chore: update changeset for ${releases.length} release(s)`
      }
    },

    getVersionMessage: async ({ changesets, preState, releases }) => {
      try {
        // 初始化 providers
        if (commitManager.providers.length === 0) {
          await commitManager.providersManager.initialize()
        }

        const commitData: IResult = { title: "todo: getVersionMessage", body: "..." }
        return [commitData.title, ...(commitData.body ? [commitData.body] : [])].join("\n")
      } catch (error) {
        console.error(chalk.red("Failed to generate version commit message:"), error)
        return `chore: version packages${preState ? ` (${preState.tag})` : ""}`
      }
    },
  }
}

export default getCommitFunctions
