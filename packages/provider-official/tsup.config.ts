import { omcProvidersDir } from "@shared/server"
import * as path from "node:path"
import { defineConfig } from "tsup"
import baseConfig from "../../tsup.config"

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts"],
  format: ["cjs"],
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: [/.*/], // 打包所有依赖
  outDir: path.join(omcProvidersDir, "official"),
})
