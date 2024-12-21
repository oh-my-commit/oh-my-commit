import path, { resolve } from "path"
import { fileURLToPath } from "url"
import baseConfig from "../__base__/webpack.config.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('webpack').Configuration} */
export default (env, argv) => {
  const isProduction = argv.mode === "production"
  const isDevelopment = !isProduction

  return {
    ...baseConfig(env, argv),
    entry: "./src/main.tsx",
    output: {
      path: resolve(__dirname, "../../dist/webview-ui"),
      filename: "main.js",
      clean: isProduction,
    },
  }
}
