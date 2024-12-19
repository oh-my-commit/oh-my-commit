import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  onSuccess: "tsc --emitDeclarationOnly --declaration", // 生成类型文件
})
