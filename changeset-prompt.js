const { getPackages } = require("@manypkg/get-packages")
const { read } = require("@changesets/config")
const { getChangedPackages } = require("@changesets/git")
// const {
//   promptPackagesWithOptions,
// } = require("@changesets/cli/dist/declarations/src/commands/add/createChangeset")
const { blue } = require("chalk")

async function run() {
  const cwd = process.cwd()
  const config = await read(cwd)
  const packages = await getPackages(cwd)
  const changedPackages = await getChangedPackages(packages, config)

  const selectedPackages = await promptPackagesWithOptions(changedPackages, config)

  // 使用你的 commit 生成逻辑替代原有的 summary 输入
  const summary = "todo: integration"

  // 创建 changeset
  await write({
    summary,
    releases: selectedPackages,
    dir: cwd,
  })

  console.log(blue("Summary:"), summary)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
