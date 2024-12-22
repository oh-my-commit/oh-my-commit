import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/extension.ts"],
  outDir: "../../dist",
  format: ["cjs"],
  platform: "node",
  target: "node16",
  sourcemap: true,
  clean: false,
  minify: false,
  watch: true,
  esbuildOptions(options) {
    options.external = ["vscode"]
    options.keepNames = true
  }
})
