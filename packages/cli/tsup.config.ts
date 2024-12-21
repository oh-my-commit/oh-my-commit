import { defineConfig } from "tsup"
import baseConfig from "../__base__/tsup.config"

export default defineConfig({
  ...baseConfig,
  // dts: {
  //   compilerOptions: {
  //     composite: false,
  //     experimentalDecorators: true,
  //     emitDecoratorMetadata: true,
  //     // --experimentalDecorators --emitDecoratorMetadata
  //   },
  // },
  entry: ["./src/index.ts"],
  format: ["cjs"],
  // onSuccess: "tsc --experimentalDecorators --emitDecoratorMetadata",
})
