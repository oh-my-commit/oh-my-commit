import { resolve } from "path"
import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  // 必须，否则打包有问题
  dts: false,

  minify: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  format: ["cjs", "esm"],
  esbuildOptions(options) {
    options.alias = {
      "@": resolve("src"),
      "@shared": resolve(__dirname, "../shared/src"),
    }
  },
})
