"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const zod_1 = require("zod");
const commander_1 = require("commander");
// 从 package.json 读取配置描述
function loadPackageConfig() {
    const packagePath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return packageJson.contributes.configuration.properties;
}
// 生成配置表格
function generateConfigTable() {
    const properties = loadPackageConfig();
    let table = "| 配置项 | 类型 | 默认值 | 说明 | 可选值 |\n";
    table += "| --- | --- | --- | --- | --- |\n";
    // 按 order 排序
    const sortedEntries = Object.entries(properties).sort((a, b) => (a[1].order ?? Infinity) - (b[1].order ?? Infinity));
    for (const [key, value] of sortedEntries) {
        const description = value.markdownDescription || value.description || "";
        const type = value.type;
        const defaultValue = value.default === undefined
            ? "-"
            : typeof value.default === "string"
                ? `"${value.default}"`
                : String(value.default);
        let options = "";
        if (value.enum && value.enumDescriptions) {
            options = value.enum
                .map((enumValue, index) => `• \`${enumValue}\`: ${value.enumDescriptions[index]}`)
                .join("<br>");
        }
        else if (value.enum) {
            options = value.enum
                .map((enumValue) => `• \`${enumValue}\``)
                .join("<br>");
        }
        else if (type === "boolean") {
            options = "`true / false`";
        }
        table += `| \`${key}\` | ${type} | ${defaultValue} | ${description} | ${options} |\n`;
    }
    return table;
}
// 命令行参数解析
const argsSchema = zod_1.z
    .object({
    outputPath: zod_1.z.string().optional(),
    sectionTitle: zod_1.z.string(),
})
    .transform((args) => ({
    ...args,
    // 如果提供了路径，转换为绝对路径
    outputPath: args.outputPath
        ? path.resolve(process.cwd(), args.outputPath)
        : undefined,
}));
function parseArgs() {
    const program = new commander_1.Command();
    program
        .name("gen-docs")
        .description("生成配置文档")
        .option("-o, --out <path>", "输出文件路径")
        .option("-t, --title <title>", "用户配置章节标题", "用户配置")
        .version("1.0.0");
    program.parse();
    const opts = program.opts();
    return argsSchema.parse({
        outputPath: opts.out,
        sectionTitle: opts.title,
    });
}
// 主函数
function main() {
    const args = parseArgs();
    const table = generateConfigTable();
    if (args.outputPath) {
        const outputDir = path.dirname(args.outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        if (path.basename(args.outputPath) === "README.md") {
            let content = "";
            if (fs.existsSync(args.outputPath)) {
                content = fs.readFileSync(args.outputPath, "utf8");
                const configStart = content.indexOf(`## ${args.sectionTitle}`);
                const configEnd = content.indexOf("##", configStart + 1);
                if (configStart !== -1) {
                    const before = content.slice(0, configStart);
                    const after = configEnd !== -1 ? content.slice(configEnd) : "";
                    content =
                        before + `## ${args.sectionTitle}\n\n` + table + "\n" + after;
                }
                else {
                    content += `\n## ${args.sectionTitle}\n\n` + table;
                }
            }
            else {
                content =
                    `# Yet Another Auto Commit\n\n## ${args.sectionTitle}\n\n` + table;
            }
            fs.writeFileSync(args.outputPath, content);
            console.log(`配置表格已写入：${args.outputPath}`);
        }
        else {
            fs.writeFileSync(args.outputPath, table);
            console.log(`配置表格已写入：${args.outputPath}`);
        }
    }
    else {
        console.log(table);
    }
}
main();
