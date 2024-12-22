import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/extension.ts"],
  outDir: "../../dist",
  // platform: "node",
  // format: ["cjs"],
  // sourcemap: true,
  // clean: true,
  // watch: true,
})
