const path = require("path");
const nodeLibs = require("node-libs-browser");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  // 创建fallback配置
  const fallback = {};
  Object.entries(nodeLibs).forEach(([name, path]) => {
    fallback[name] = path === null ? false : path;
  });

  return {
    mode: argv.mode || "development",
    entry: "./src/main.tsx",
    output: {
      path: path.resolve(__dirname, "../../dist/webview-ui"),
      filename: "main.js",
      clean: isDevelopment ? false : true,
    },
    devtool: isDevelopment ? "eval-source-map" : "source-map",
    watch: isDevelopment,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 100,
      poll: 1000,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      fallback
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
    optimization: {
      minimize: isProduction,
    },
  };
};
