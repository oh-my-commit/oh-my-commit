import { defineConfig } from "tsup"
import baseConfig from "../../tsup.config"

export default defineConfig({
  ...baseConfig,
  // shared 必须要 dts 以生成 .d.ts，但无法开 composite
  dts: {
    compilerOptions: {
      composite: false,
    },
  },

  onSuccess: "tsc --emitDeclarationOnly --declaration",

  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts"],
})
