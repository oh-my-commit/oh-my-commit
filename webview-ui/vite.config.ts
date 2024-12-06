import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        plugins: ["@babel/plugin-transform-react-jsx"],
      },
    }),
  ],
  build: {
    outDir: "../dist/webview",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/main.tsx"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].[hash].js",
        assetFileNames: "[name].[ext]",
        format: "es",
        inlineDynamicImports: true,
      },
    },
    target: "esnext",
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true,
  },
});
