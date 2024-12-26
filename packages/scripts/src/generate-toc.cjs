const toc = require("markdown-toc")
const fs = require("fs")
const path = require("path")
const glob = require("glob")
const chalk = require("chalk")
const parseArgs = require("minimist")

// 解析命令行参数
const argv = parseArgs(process.argv.slice(2), {
  string: ["files", "patterns"], // 字符串参数
  boolean: ["autoInsert", "help"], // 布尔参数
  alias: {
    f: "files",
    p: "patterns",
    a: "autoInsert",
    h: "help",
  },
  default: {
    autoInsert: undefined, // undefined 表示使用配置文件的值
  },
})

// 显示帮助信息
if (argv.help) {
  console.log(`
使用方法: node generate-toc.js [选项]

选项:
  -f, --files      指定要处理的文件，用逗号分隔
  -p, --patterns   指定要处理的文件模式，用逗号分隔
  -a, --autoInsert 是否自动插入目录标记 (true/false)
  -h, --help       显示帮助信息

示例:
  node generate-toc.js --files README.md,CONTRIBUTING.md
  node generate-toc.js --patterns "docs/*.md,*.md" --autoInsert
  node generate-toc.js -f README.md -a true
`)
  process.exit(0)
}

// 状态图标
const STATUS = {
  SKIP: "○", // 跳过
  SUCCESS: "●", // 成功
  INFO: "◐", // 信息
  ERROR: "◆", // 错误
}

// 检测是否包含 toc 标记
function hasTocMarkers(content) {
  return content.includes("<!-- toc -->") && content.includes("<!-- tocstop -->")
}

// 在指定位置插入 toc 标记
function insertTocMarkers(content) {
  const lines = content.split("\n")
  const h1Index = lines.findIndex((line) => /^#\s/.test(line))

  // 找到插入位置：第一个一级标题后，或文件开头
  const insertIndex = h1Index !== -1 ? h1Index + 1 : 0

  // 插入标记
  lines.splice(insertIndex, 0, "", "<!-- toc -->", "", "<!-- tocstop -->", "")
  return lines.join("\n")
}

// 读取配置文件并合并命令行参数
function loadConfig() {
  let config = {
    files: [],
    patterns: [],
    autoInsert: false,
  }

  // 尝试读取配置文件
  const configPath = path.join(process.cwd(), ".toc.config.json")
  try {
    config = { ...config, ...require(configPath) }
  } catch (error) {
    console.log(
      chalk.yellow(`
提示：未找到 .toc.config.json 配置文件
我们推荐使用配置文件来管理需要自动更新目录的文档，而不是在代码中硬编码。

创建 .toc.config.json 示例：
{
  "files": ["README.md", "PRD.md"],
  "patterns": ["docs/*.md"],
  "autoInsert": true
}
`)
    )
  }

  // 合并命令行参数
  if (argv.files) {
    config.files = argv.files.split(",").map((f) => f.trim())
  }
  if (argv.patterns) {
    config.patterns = argv.patterns.split(",").map((p) => p.trim())
  }
  if (argv.autoInsert !== undefined) {
    config.autoInsert = argv.autoInsert
  }

  return config
}

// 获取需要处理的文件
function getFilesToProcess() {
  const config = loadConfig()
  const files = new Set(config.files || [])

  // 处理 glob patterns
  if (config.patterns) {
    config.patterns.forEach((pattern) => {
      glob.sync(pattern).forEach((file) => files.add(file))
    })
  }

  const result = Array.from(files)
  if (result.length === 0) {
    console.log(chalk.yellow(`${STATUS.INFO} 警告：没有找到需要处理的文件，请检查配置文件。`))
  }

  return result
}

async function writeIfChanged(filePath, newContent) {
  try {
    const currentContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : ""
    if (currentContent !== newContent) {
      fs.writeFileSync(filePath, newContent)
      return true
    }
    return false
  } catch (error) {
    throw error
  }
}

async function generateToc(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(chalk.yellow(`${STATUS.SKIP} ${filePath} 文件不存在，已跳过`))
      return
    }

    const config = loadConfig()
    let content = fs.readFileSync(filePath, "utf8")

    // 检查是否有 toc 标记
    if (!hasTocMarkers(content)) {
      if (config.autoInsert) {
        content = insertTocMarkers(content)
        console.log(chalk.blue(`${STATUS.INFO} ${filePath} 自动插入目录标记`))
      } else {
        console.log(chalk.yellow(`${STATUS.SKIP} ${filePath} 缺少目录标记，已跳过`))
        return
      }
    }

    // 生成横向目录内容
    const tocContent = toc(content)
      .json.filter((heading) => heading.lvl === 2)
      .map((heading) => `[${heading.content}](#${toc.slugify(heading.content)})`)
      .join(" • ")

    // 包装成完整的 toc 块
    const tocBlock = `<!-- toc -->\n\n${tocContent}\n\n<!-- tocstop -->`

    // 替换已有的 toc 内容
    const newContent = content.replace(/<!-- toc -->[\s\S]*?<!-- tocstop -->/, tocBlock)

    const changed = await writeIfChanged(filePath, newContent)
    if (changed) {
      console.log(chalk.green(`${STATUS.SUCCESS} ${filePath} 更新完成`))
    } else {
      console.log(chalk.blue(`${STATUS.INFO} ${filePath} 无需更新`))
    }
  } catch (error) {
    console.error(chalk.red(`${STATUS.ERROR} ${filePath} 错误: ${error.message}`))
  }
}

// 并发处理所有文件
async function processAllFiles() {
  console.log(chalk.cyan("\n🔍开始检查文档目录..."))

  const files = getFilesToProcess()
  await Promise.all(files.map(generateToc))

  console.log(chalk.green(`\n${STATUS.SUCCESS} 所有文件处理完成！`))
}

// 开始处理
processAllFiles()
