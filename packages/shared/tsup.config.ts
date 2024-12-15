import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
    entry: "./src/index.ts",
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  tsconfig: "tsconfig.build.json",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".mjs",
    };
  },
});
