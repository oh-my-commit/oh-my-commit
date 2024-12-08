const path = require("path");
const webpack = require('webpack');
const https = require('https');
const fs = require('fs');

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    mode: argv.mode || "development",
    entry: "./src/main.tsx",
    output: {
      path: path.resolve(__dirname, "../dist/webview-ui"),
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
    devtool: isDevelopment ? "inline-source-map" : "source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],
      alias: {
        "@": path.resolve(__dirname, "src"),
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
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.md$/,
          type: 'asset/source',
          use: 'raw-loader'
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader'
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        }
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
    plugins: [
      new webpack.NormalModuleReplacementPlugin(
        /^@github-md:(.*)$/,
        (resource) => {
          const githubUrl = resource.request.replace('@github-md:', '');
          resource.request = path.resolve(__dirname, `.temp/${path.basename(githubUrl)}`);
          
          // 在编译时下载文件
          if (!fs.existsSync('.temp')) {
            fs.mkdirSync('.temp');
          }
          
          https.get(githubUrl, (response) => {
            let data = '';
            response.on('data', (chunk) => data += chunk);
            response.on('end', () => {
              fs.writeFileSync(resource.request, data);
            });
          });
        }
      )
    ]
  };
};
