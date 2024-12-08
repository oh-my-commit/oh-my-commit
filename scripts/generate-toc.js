const toc = require("markdown-toc");
const fs = require("fs");

function generateToc(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // 生成横向目录内容
  const tocContent = toc(content)
    .json.filter((heading) => heading.lvl === 2)
    .map((heading) => `[${heading.content}](#${toc.slugify(heading.content)})`)
    .join(" • ");

  // 包装成完整的 toc 块
  const tocBlock = `<!-- toc -->\n\n${tocContent}\n\n<!-- tocstop -->`;

  // 如果已有 toc 标记，替换内容；否则在第一个标题后插入
  if (content.includes("<!-- toc -->")) {
    const newContent = content.replace(
      /<!-- toc -->[\s\S]*?<!-- tocstop -->/,
      tocBlock
    );
    fs.writeFileSync(filePath, newContent);
  } else {
    // 在第一个标题后插入目录
    const lines = content.split("\n");
    const titleIndex = lines.findIndex((line) => /^#\s/.test(line));

    if (titleIndex !== -1) {
      lines.splice(titleIndex + 1, 0, "", tocBlock, "");
      fs.writeFileSync(filePath, lines.join("\n"));
    } else {
      // 如果没有找到标题，就插入到文件开头
      fs.writeFileSync(filePath, `${tocBlock}\n\n${content}`);
    }
  }
}

// 处理文件
["README.md", "PRD.md", "FAQ.md", "CONTRIBUTING.md"].forEach(generateToc);
