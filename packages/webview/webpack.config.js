import CopyWebpackPlugin from "copy-webpack-plugin"
import path, { resolve } from "path"
import { fileURLToPath } from "url"
import { DefinePlugin } from "webpack"
import baseConfig from "../__base__/webpack.config.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// const distDir = resolve(__dirname, "../extension/dist/webview")
const distDir = resolve(__dirname, "dist") 

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
      new DefinePlugin({
        'process.env': JSON.stringify({
          NODE_ENV: argv.mode,
          // 添加其他需要的环境变量
        }),
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
      }),
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
