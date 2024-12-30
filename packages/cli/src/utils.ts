/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-30
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import chalk from "chalk"
import figlet from "figlet"
import { readFileSync } from "fs"
import path, { resolve } from "path"

import packageJson from "../package.json"

export const displayBanner = () => {
  // 解析并加载字体
  const fontName = "Big"
  const fontDir = resolve(require.resolve("figlet/package.json"), "../fonts")
  const fontPath = path.join(fontDir, `${fontName}.flf`)
  const fontData = readFileSync(fontPath, "utf8")
  figlet.parseFont(fontName, fontData)

  // 使用默认字体，避免复杂的字体加载逻辑
  console.log(
    chalk.cyan(
      figlet.textSync("Oh My Commit", {
        horizontalLayout: "default",
      })
    )
  )
  console.log(chalk.gray("✨ AI-powered commit message generator\n" + `📦 Version ${packageJson.version}\n`))
}
