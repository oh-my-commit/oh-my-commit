import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import path from "path"
import { fileURLToPath } from "url"
import ReactRefreshBabel from 'react-refresh/babel'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default (env, argv) => {
  const isProduction = argv.mode === "production"
  const isDevelopment = !isProduction

  return {
    mode: argv.mode || "development",
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    plugins: [isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean),
    devServer: {
      hot: true,
      devMiddleware: {
        writeToDisk: true, // 仍然写入磁盘作为备份
      },
      liveReload: false,
      host: "localhost",
      port: 8081,
      allowedHosts: "all", // 允许所有主机
      client: {
        webSocketURL: false, // 禁用 WebSocket，因为我们在 VSCode webview 中
        overlay: true,
        logging: "info",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": [path.resolve(".", "src")],
        "@shared": [path.resolve(__dirname, "../shared/src")],
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  ["@babel/preset-react", {"runtime": "automatic"}],
                  '@babel/preset-typescript'
                ],
                plugins: [
                  isDevelopment && ReactRefreshBabel,
                  ["@babel/plugin-proposal-decorators", { "legacy": true }],
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.md$/,
          type: "asset/source",
          use: "raw-loader",
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
    optimization: {
      minimize: isProduction,
    },
  }
}
