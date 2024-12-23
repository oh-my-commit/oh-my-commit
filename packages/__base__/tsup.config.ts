import { resolve } from "path"
import { defineConfig } from "tsup"

const isDev = true // process.env.NODE_ENV !== "production"

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
