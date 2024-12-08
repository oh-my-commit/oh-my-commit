const toc = require("markdown-toc");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

// 检测是否包含 toc 标记
function hasTocMarkers(content) {
  return content.includes("<!-- toc -->") && content.includes("<!-- tocstop -->");
}

// 在指定位置插入 toc 标记
function insertTocMarkers(content) {
  const lines = content.split("\n");
  const h1Index = lines.findIndex(line => /^#\s/.test(line));
  
  // 找到插入位置：第一个一级标题后，或文件开头
  const insertIndex = h1Index !== -1 ? h1Index + 1 : 0;
  
  // 插入标记
  lines.splice(insertIndex, 0, "", "<!-- toc -->", "", "<!-- tocstop -->", "");
  return lines.join("\n");
}

// 读取配置文件
function loadConfig() {
  const configPath = path.join(process.cwd(), ".toc.config.json");
  try {
    return require(configPath);
  } catch (error) {
    console.log(
      "\x1b[33m%s\x1b[0m",
      `
提示：未找到 .toc.config.json 配置文件
我们推荐使用配置文件来管理需要自动更新目录的文档，而不是在代码中硬编码。

创建 .toc.config.json 示例：
{
  "files": ["README.md", "PRD.md"],
  "patterns": ["docs/*.md"],
  "autoInsert": true
}
`
    );
    return { files: [], patterns: [], autoInsert: false };
  }
}

// 获取需要处理的文件
function getFilesToProcess() {
  const config = loadConfig();
  const files = new Set(config.files || []);

  // 处理 glob patterns
  if (config.patterns) {
    config.patterns.forEach((pattern) => {
      glob.sync(pattern).forEach((file) => files.add(file));
    });
  }

  const result = Array.from(files);
  if (result.length === 0) {
    console.log(
      "\x1b[33m%s\x1b[0m",
      "警告：没有找到需要处理的文件，请检查配置文件。"
    );
  }

  return result;
}

function writeIfChanged(filePath, newContent) {
  try {
    const currentContent = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf8")
      : "";
    if (currentContent !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ 已更新 ${filePath} 的目录`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 处理 ${filePath} 时出错:`, error);
    return false;
  }
}

function generateToc(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  跳过 ${filePath} - 文件不存在`);
    return;
  }

  const config = loadConfig();
  let content = fs.readFileSync(filePath, "utf8");

  // 检查是否有 toc 标记
  if (!hasTocMarkers(content)) {
    if (config.autoInsert) {
      console.log(`📝 ${filePath} 中未找到目录标记，自动插入中...`);
      content = insertTocMarkers(content);
    } else {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `
提示：${filePath} 中未找到目录标记
请在文档中添加以下标记来启用自动目录更新：

<!-- toc -->
<!-- tocstop -->

或在 .toc.config.json 中设置 "autoInsert": true 来自动插入标记
`
      );
      return;
    }
  }

  // 生成横向目录内容
  const tocContent = toc(content)
    .json.filter((heading) => heading.lvl === 2)
    .map((heading) => `[${heading.content}](#${toc.slugify(heading.content)})`)
    .join(" • ");

  // 包装成完整的 toc 块
  const tocBlock = `<!-- toc -->\n\n${tocContent}\n\n<!-- tocstop -->`;

  // 替换已有的 toc 内容
  const newContent = content.replace(
    /<!-- toc -->[\s\S]*?<!-- tocstop -->/,
    tocBlock
  );
  writeIfChanged(filePath, newContent);
}

// 处理配置的文件
console.log("🔍 开始检查文档目录...");
getFilesToProcess().forEach(generateToc);
console.log("✨ 目录检查完成！");
