/**
 * @Copyright Copyright (c) 2024 Oh My Commit
 * @CreatedAt 2024-12-29
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { resolve } from "path"
import { defineConfig } from "tsup"

const isDev = process.env["NODE_ENV"] === "development"

export default defineConfig({
  clean: isDev ? false : true,
  dts: false,
  minify: !isDev,
  sourcemap: isDev,
  splitting: false,
  treeshake: !isDev,
  format: ["cjs", "esm"],

  // 启用装饰器和元数据支持
  esbuildOptions(options) {
    options.alias = {
      "@": resolve("src"),
      "@shared": resolve("../shared/src"),
    }
    options.target = "es2020"
    options.define = {
      "process.env.REFLECT_METADATA": "true",
    }
    options.jsx = "transform"
    options.tsconfig = resolve(__dirname, "tsconfig.json")
  },
})
