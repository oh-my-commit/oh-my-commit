/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { exec } from "child_process"
import { promises } from "fs"
import { resolve } from "path"
import { defineConfig } from "tsup"

import baseConfig from "../__base__/tsup.config"
import { TEMPLATES_DIR } from "./src/server/path.map"

export default defineConfig({
  ...baseConfig,
  // shared 必须要 dts 以生成 .d.ts，但无法开 composite

  splitting: true,
  external: ["@anthropic-ai/sdk", "handlebars"],

  dts: {
    compilerOptions: {
      composite: false,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      // --experimentalDecorators --emitDecoratorMetadata
    },
  },

  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts", "src/server/config.ts"],

  loader: {
    ".hbs": "copy",
  },

  onSuccess: async () => {
    // Generate TypeScript declaration files
    await new Promise((resolve, reject) => {
      exec("tsc --emitDeclarationOnly --declaration", (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating declarations: ${error}`)
          reject(error)
          return
        }
        resolve(stdout)
      })
    })

    // Copy prompts to output directory
    const promptsDir = resolve(__dirname, "../../docs/prompts")
    const outPromptsDir = TEMPLATES_DIR
    await promises.mkdir(outPromptsDir, { recursive: true })
    await promises.cp(promptsDir, outPromptsDir, { recursive: true })
  },
})
