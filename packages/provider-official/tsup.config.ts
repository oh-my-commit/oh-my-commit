/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { resolve } from "path"
import { defineConfig } from "tsup"

import { PROVIDERS_DIR } from "@shared/server/config"

import baseConfig from "../__base__/tsup.config"

const outDir = resolve(PROVIDERS_DIR, "official")

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  noExternal: [/.*/], // 打包所有依赖
  outDir,
})
