import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"

export default defineConfig({
  ...baseConfig,
  // shared 必须要 dts 以生成 .d.ts，但无法开 composite
  dts: {
    compilerOptions: {
      composite: false,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      // --experimentalDecorators --emitDecoratorMetadata
    },
  },

  onSuccess: "tsc --emitDeclarationOnly --declaration",

  entry: ["src/common/index.ts", "src/server/index.ts", "src/server/config.ts"],
})
