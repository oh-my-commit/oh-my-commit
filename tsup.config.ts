import { defineConfig } from "tsup"

export default defineConfig({
  // add entry
  entry: ["src/index.ts"],
  // default
  outDir: "dist",

  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  shims: true,

  dts: false, // 禁用 tsup 的 dts 生成
  onSuccess: "tsc --emitDeclarationOnly --declaration --declarationMap", // 使用 tsc 生成声明文件
})
