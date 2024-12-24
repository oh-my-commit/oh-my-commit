import { defineConfig } from "tsup"
import basaeConfig from "../__base__/tsup.config"

export default defineConfig({
  ...basaeConfig,
  entry: ["src/extension.ts"],
  outDir: "dist",
  format: ["cjs"],
})