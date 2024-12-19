import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

function getModulePath() {
  try {
    // 尝试使用 require.main
    if (require.main?.filename) {
      return dirname(require.main.filename);
    }
  } catch (e) {
    // ignore
  }

  try {
    // 尝试使用 import.meta
    if (typeof import.meta?.url === "string") {
      return dirname(fileURLToPath(import.meta.url));
    }
  } catch (e) {
    // ignore
  }

  // 最后尝试使用 __dirname
  return dirname(__filename);
}

const require = createRequire(
  typeof import.meta?.url === "string" ? import.meta.url : __filename
);

export function getTemplatesDir(): string {
  try {
    // 尝试从包中解析模板目录
    const templatePath = require.resolve("@oh-my-commit/shared/templates/commit-prompt.hbs");
    return dirname(templatePath);
  } catch (e) {
    // 开发环境或打包后的环境
    const currentDir = getModulePath();
    console.log("Current directory:", currentDir);

    const possiblePaths = [
      // VSCode 扩展目录
      join(currentDir, "templates"),
      // 开发环境
      join(currentDir, "..", "templates"),
      // 打包后的环境
      join(dirname(currentDir), "templates"),
    ];

    for (const path of possiblePaths) {
      try {
        const testPath = join(path, "commit-prompt.hbs");
        require("fs").accessSync(testPath);
        console.log("Found templates at:", path);
        return path;
      } catch (err) {
        console.log("Failed to find templates at:", path);
      }
    }

    throw new Error(`Cannot find templates directory. Tried paths: ${possiblePaths.join(", ")}`);
  }
}
