import { resolve } from "path"
import { defineConfig } from "tsup"

const isDev = true // process.env.NODE_ENV !== "production"

export default defineConfig({
  clean: isDev ? false : true,
  dts: false,
  minify: !isDev,
  sourcemap: isDev,
  splitting: false, 
  treeshake: !isDev,
  format: ["cjs", "esm"],
  esbuildOptions(options) {
    options.alias = {
      "@": resolve("src"),
      "@shared": resolve(__dirname, "../shared/src"),
    }
  },
})
