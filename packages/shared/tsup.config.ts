import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/common/index.ts", "src/server/index.ts"],
  outDir: "../../dist/shared",
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  onSuccess: "tsc --emitDeclarationOnly --declaration",
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  shims: true,
})
