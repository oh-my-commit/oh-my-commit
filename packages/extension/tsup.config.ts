import basaeConfig from "packages/base/tsup.config"
import { defineConfig } from "tsup"

export default defineConfig({
  ...basaeConfig,
  entry: ["src/extension.ts"],
  outDir: "dist",
  format: ["cjs"],
  platform: "node",
  target: "node16",
  splitting: false,
  sourcemap: true,
  clean: true,
})
