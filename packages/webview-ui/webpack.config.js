const path = require("path");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    mode: argv.mode || "development",
    entry: "./src/main.tsx",
    output: {
      path: path.resolve(__dirname, "../../dist/webview-ui"),
      filename: "main.js",
      clean: true,
      ...(isProduction
        ? {
            libraryTarget: "module",
            chunkFormat: "module",
          }
        : {}),
    },
    experiments: {
      outputModule: isProduction,
    },
    devtool: isDevelopment ? "eval" : "source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      fallback: {
        "path": require.resolve("path-browserify")
      }
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
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 100,
      poll: 1000,
    },
    optimization: {
      minimize: isProduction,
    },
  };
};
