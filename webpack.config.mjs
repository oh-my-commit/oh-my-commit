import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import HtmlWebpackPlugin from "html-webpack-plugin"
import path from "path"
import reactRefreshTypeScript from "react-refresh-typescript"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default (env, argv) => {
  const isProduction = argv.mode === "production"
  const isDevelopment = !isProduction

  return {
    mode: argv.mode || "development",

    devtool: isDevelopment ? "eval-source-map" : "source-map",
    watch: isDevelopment,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 100,
      poll: 1000,
    },
    devServer: {
      devMiddleware: {
        writeToDisk: true, // 仍然写入磁盘作为备份
      },
      hot: true,
      host: "localhost",
      port: 8081,
      allowedHosts: "all", // 允许所有主机
      client: {
        webSocketURL: "ws://localhost:8081/ws",
        // 允许所有源
        webSocketTransport: "ws",
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": [path.resolve(".", "src")],
        "@shared": [path.resolve(__dirname, "packages/shared/src")],
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                compilerOptions: {
                  sourceMap: true,
                  noEmit: false,
                },
                ...(isDevelopment && {
                  getCustomTransformers: () => ({
                    before: [reactRefreshTypeScript()],
                  }),
                }),
              },
            },
          ],
          exclude: /node_modules/,
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
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    optimization: {
      minimize: isProduction,
    },
  }
}
