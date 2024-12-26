/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { defineConfig } from "tsup"

import basaeConfig from "../__base__/tsup.config"

export default defineConfig({
  ...basaeConfig,
  entry: ["src/extension.ts"],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node16",
  splitting: false,
  sourcemap: true,
  clean: true,
})
