// @ts-ignore
import { PROVIDERS_DIR } from "@shared/server/config"
import baseConfig from "../__base__/tsup.config"
import { resolve } from "path"
import { defineConfig } from "tsup"

const outDir = resolve(PROVIDERS_DIR, "official")

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  noExternal: [/.*/], // 打包所有依赖
  outDir,
})
