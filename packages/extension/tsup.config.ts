import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"

export default defineConfig({
  ...baseConfig,
  entry: ["./src/extension.ts"],
  outDir: "../../dist",
  format: ["cjs"],
  dts: {
    compilerOptions: {
      composite: false,
      outDir: "../../dist",
    }
  },
  // esbuildOptions(options) {
  //   options.sourcemap = true
  //   options.sourcesContent = true
  //   options.sourceRoot = "/"
  //   options.keepNames = true
  //   options.legalComments = "inline"
  //   options.metafile = true
  //   options.define = {
  //     "process.env.NODE_ENV": '"development"'
  //   }
  // }
  // onSuccess: "tsc --emitDeclarationOnly --declaration"
})
