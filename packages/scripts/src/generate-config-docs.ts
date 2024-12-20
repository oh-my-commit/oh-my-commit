import { Command } from "commander"
import * as fs from "fs"
import * as path from "path"
import { z } from "zod"

type VSCodeConfigurationItem = {
  type: string
  default?: any
  description?: string
  markdownDescription?: string
  enum?: string[]
  enumDescriptions?: string[]
  order?: number
}

type VSCodeConfiguration = {
  title: string
  properties: Record<string, VSCodeConfigurationItem>
}

type PackageJson = {
  contributes: {
    configuration: VSCodeConfiguration
  }
}

// 从 package.json 读取配置描述
function loadPackageConfig() {
  const packagePath = path.join(__dirname, "..", "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as PackageJson
  return packageJson.contributes.configuration.properties
}

// 生成配置表格
function generateConfigTable() {
  const properties = loadPackageConfig()
  let table = "| 配置项 | 类型 | 默认值 | 说明 | 可选值 |\n"
  table += "| --- | --- | --- | --- | --- |\n"

  // 按 order 排序
  const sortedEntries = Object.entries(properties).sort(
    (a, b) => (a[1].order ?? Infinity) - (b[1].order ?? Infinity),
  )

  for (const [key, value] of sortedEntries) {
    const description = value.markdownDescription || value.description || ""
    const type = value.type
    const defaultValue =
      value.default === undefined
        ? "-"
        : typeof value.default === "string"
          ? `"${value.default}"`
          : String(value.default)

    let options = ""
    if (value.enum && value.enumDescriptions) {
      options = value.enum
        .map((enumValue, index) => `• \`${enumValue}\`: ${value.enumDescriptions![index]}`)
        .join("<br>")
    } else if (value.enum) {
      options = value.enum.map(enumValue => `• \`${enumValue}\``).join("<br>")
    } else if (type === "boolean") {
      options = "`true / false`"
    }

    table += `| \`${key}\` | ${type} | ${defaultValue} | ${description} | ${options} |\n`
  }

  return table
}

// 命令行参数解析
const argsSchema = z
  .object({
    outputPath: z.string().optional(),
    sectionTitle: z.string(),
  })
  .transform(args => ({
    ...args,
    // 如果提供了路径，转换为绝对路径
    outputPath: args.outputPath ? path.resolve(process.cwd(), args.outputPath) : undefined,
  }))

type Args = z.infer<typeof argsSchema>

function parseArgs(): Args {
  const program = new Command()

  program
    .name("gen-docs")
    .description("生成配置文档")
    .option("-o, --out <path>", "输出文件路径")
    .option("-t, --title <title>", "用户配置章节标题", "用户配置")
    .version("1.0.0")

  program.parse()

  const opts = program.opts()

  return argsSchema.parse({
    outputPath: opts.out,
    sectionTitle: opts.title,
  })
}

// 主函数
function main() {
  const args = parseArgs()
  const table = generateConfigTable()

  if (args.outputPath) {
    const outputDir = path.dirname(args.outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    if (path.basename(args.outputPath) === "README.md") {
      let content = ""
      if (fs.existsSync(args.outputPath)) {
        content = fs.readFileSync(args.outputPath, "utf8")
        const configStart = content.indexOf(`## ${args.sectionTitle}`)
        const configEnd = content.indexOf("##", configStart + 1)

        if (configStart !== -1) {
          const before = content.slice(0, configStart)
          const after = configEnd !== -1 ? content.slice(configEnd) : ""
          content = before + `## ${args.sectionTitle}\n\n` + table + "\n" + after
        } else {
          content += `\n## ${args.sectionTitle}\n\n` + table
        }
      } else {
        content = `# Yet Another Auto Commit\n\n## ${args.sectionTitle}\n\n` + table
      }
      fs.writeFileSync(args.outputPath, content)
      console.log(`配置表格已写入：${args.outputPath}`)
    } else {
      fs.writeFileSync(args.outputPath, table)
      console.log(`配置表格已写入：${args.outputPath}`)
    }
  } else {
    console.log(table)
  }
}

main()
