import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

export function getTemplatesDir(): string {
  try {
    // 尝试从包中解析模板目录
    const templatePath = require.resolve(
      "@oh-my-commit/shared/templates/commit-prompt.hbs"
    );
    return dirname(templatePath);
  } catch (e) {
    // 开发环境下的fallback路径
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // 在打包后的环境中，文件结构是：
    // dist/
    //   ├── server/
    //   │   └── get-templates-dir.js
    //   └── templates/
    return join(__dirname, "..", "templates");
  }
}
