// @ts-ignore
import { PROVIDERS_DIR } from "@shared/server/config"
import * as path from "node:path"
import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"
import { resolve } from "path"

const isDev = true // process.env.NODE_ENV !== "production"

export default defineConfig({
  ...baseConfig,
  clean: isDev ? false : true,
  dts: false,
  minify: !isDev,
  sourcemap: isDev,
  splitting: false, 
  treeshake: !isDev,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  
  noExternal: [/.*/], // 打包所有依赖
  outDir: path.join(PROVIDERS_DIR, "official"),
  
  // 启用装饰器和元数据支持
  esbuildOptions(options) {
    options.alias = {
      "@": resolve("src"),
      "@shared": resolve(__dirname, "../shared/src"),
    }
    options.target = "es2020"
    options.define = {
      "process.env.REFLECT_METADATA": "true"
    }
    options.jsx = 'transform'
    options.tsconfig = resolve(__dirname, "tsconfig.json")
  },

  // 启用装饰器支持
  tsconfig: resolve(__dirname, "tsconfig.json")
})
