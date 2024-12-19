import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      moduleResolution: "Node",
      composite: false,
      incremental: false,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
})
