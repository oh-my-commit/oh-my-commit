/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { defineConfig } from "tsup"

import basaeConfig from "../__base__/tsup.config"

const pkg = require("./package.json")

export default defineConfig(() => {
  return {
    ...basaeConfig,
    entry: ["src/extension.ts"],
    external: ["vscode"],
    noExternal: Object.keys(pkg.dependencies),
    outDir: "dist/main",
    format: ["cjs"],
    platform: "node",
    target: "node16",
    splitting: false,
    clean: true,
  }
})
