import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"

export default defineConfig({
  ...baseConfig,
  entry: ["./src/extension.ts"],
  outDir: "../../dist",
  format: ["cjs"],
  watch: "./src/**/*.ts",  // 直接指定监听的文件模式
  sourcemap: true,
  clean: false,
})
