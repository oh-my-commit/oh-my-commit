import CopyWebpackPlugin from "copy-webpack-plugin"
import path, { resolve } from "path"
import { fileURLToPath } from "url"
import baseConfig from "../__base__/webpack.config.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectDir = resolve(__dirname, "../..")
const distDir = resolve(projectDir, "dist/webview")

/** @type {import('webpack').Configuration} */
const config = (env, argv) => {
  const isProduction = argv.mode === "production"
  const isDevelopment = !isProduction
  
  return {
    ...baseConfig(env, argv),
    entry: {
      main: "./src/main.tsx",
    },
    output: {
      path: distDir,
      filename: "[name].js",
      clean: isProduction,
    },
    plugins: [
      ...(baseConfig(env, argv).plugins || []),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "index.html",
            to: distDir,
          },
        ],
      }),
    ],
  }
}

export default config
