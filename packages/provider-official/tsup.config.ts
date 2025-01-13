/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { promises } from "fs"
import { join, resolve } from "path"
import { defineConfig } from "tsup"

import baseConfig from "../__base__/tsup.config"

const distDir = resolve(__dirname, "dist")
const targetExtensionDir = resolve(__dirname, "../extension/dist/providers/official")
const targetCliDir = resolve("~/.neurora/oh-my-commit/providers/official")

export default defineConfig({
  ...baseConfig,
  entry: {
    index: "src/index.ts",
  },
  outDir: distDir,
  format: ["cjs", "esm"],
  noExternal: [/.*/], // 打包所有依赖
  onSuccess: async () => {
    await promises.copyFile("./src/standard.hbs", join(distDir, "standard.hbs"))
    await promises.cp(distDir, targetExtensionDir, { recursive: true })
    await promises.cp(distDir, targetCliDir, { recursive: true })
  },
})
