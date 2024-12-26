/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @Author markshawn2020
 * @CreatedAt 2024-12-27
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { defineConfig } from "tsup"

import baseConfig from "../__base__/tsup.config"

/**
 * TODO(watch-mode): Improve watch mode for monorepo
 *
 * Current limitation: tsup's watch mode doesn't detect changes in workspace dependencies (e.g., shared package)
 *
 * Potential solutions:
 * 1. Use chokidar to watch shared package files
 * 2. Integrate with turborepo's watch feature
 * 3. Use nodemon for development
 *
 * Related discussions:
 * - tsup issue: https://github.com/egoist/tsup/issues/647
 * - turbo issue: https://github.com/vercel/turbo/issues/986
 */
export default defineConfig((options) => {
  console.log("tsup options:", options)

  return {
    ...baseConfig,
    entry: ["./src/index.ts"],
    format: ["cjs"],
    // 不要将 shared 包视为外部依赖
    noExternal: ["@oh-my-commit/shared"],
    banner: {
      js: "#!/usr/bin/env node",
    },
    platform: "node",
    target: "node18",
    onSuccess: async () => {
      console.log("Build succeeded! Watching for changes...")
    },
  }
})
