import { resolve } from "path"
import { defineConfig } from "tsup"

const isDev = true; // process.env.NODE_ENV === "development"


export default defineConfig({
  clean: true,
  // 必须，否则打包有问题
  dts: false,

  minify: !isDev,
  sourcemap: isDev,
  splitting: true,
  treeshake: true,
  format: ["cjs", "esm"],
  esbuildOptions(options) {
    options.alias = {
      "@": resolve("src"),
      "@shared": resolve(__dirname, "../shared/src"),
    }

    // if (isDev) {
    //   options.sourcemap = true
    //   options.sourcesContent = true
    //   options.sourceRoot = resolve(__dirname)
    // }
  },


})
