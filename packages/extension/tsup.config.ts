import { defineConfig } from "tsup"

import basaeConfig from "../__base__/tsup.config"

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
