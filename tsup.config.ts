import { resolve } from "path"
import { defineConfig } from "tsup"

export default defineConfig({
  // add entry
  entry: ["src/index.ts"], // default
  outDir: "dist",

  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  shims: true,

  // 默认不生成类型声明文件，由各个包自己决定
  dts: false,

  esbuildOptions: options => {
    options.alias = {
      "@": resolve("src"),
      "@shared": resolve(__dirname, "packages/shared/src"),
    }
  },
})
