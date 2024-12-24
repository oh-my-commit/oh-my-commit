// @ts-ignore
import { PROVIDERS_DIR } from "@shared/server/config"
import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"
import { resolve } from "path"
import * as fs from 'fs'

const outDir = resolve(PROVIDERS_DIR, "official")

export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
  ],
  format: ["cjs", "esm"],
  noExternal: [/.*/], // 打包所有依赖
  outDir,
  loader: {
    '.hbs': 'copy'
  },
  onSuccess: async () => {
    // Copy templates to output directory
    const templatesDir = resolve(__dirname, 'templates')
    const outTemplatesDir = resolve(outDir, 'templates')
    await fs.promises.mkdir(outTemplatesDir, { recursive: true })
    await fs.promises.cp(templatesDir, outTemplatesDir, { recursive: true })
  }
})
