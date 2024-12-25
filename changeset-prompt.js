const getAddMessage = async (changeset, type = "patch") => {
  const [firstLine, ...futureLines] = changeset.summary.split("\n").map(l => l.trim())

  // 你可以自定义 commit message 的格式
  const commitMessage = `feat: ${firstLine}

${futureLines.join("\n")}
`

  return commitMessage
}

const config = {
  $schema: "https://unpkg.com/@changesets/config@2.3.0/schema.json",
  changelog: "@changesets/cli/changelog",
  commit: true,
  fixed: [],
  linked: [],
  access: "restricted",
  baseBranch: "main",
  // 这里使用我们的自定义 commit message 生成器
  getCommitMessage: getAddMessage,
}

module.exports = config
