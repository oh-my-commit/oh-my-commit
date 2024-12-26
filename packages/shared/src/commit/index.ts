/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface AICommitOptions {
  summary: string
  changes: string
  type: "changeset" | "version"
}

export async function getAICommitMessage({
  summary,
  changes,
  type,
}: AICommitOptions): Promise<string> {
  // TODO: 集成现有的 AI commit 生成逻辑
  const context =
    type === "changeset"
      ? `Adding changeset for: ${changes}\n${summary}`
      : `Updating versions: ${changes}\n${summary}`

  // 这里应该调用项目中现有的 AI commit 生成逻辑
  return context
}
