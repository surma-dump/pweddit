const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    main: './src/main.js',
    worker: './src/worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve('./dist')
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        use: [
          'file-loader'
        ]
      },
    ]
  },
  plugins: [
    new CopyPlugin([
      {from: './src/index.html'}
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      minChunks: 2,
    }),
    // Force comlink into its own bundle
    new webpack.optimize.CommonsChunkPlugin({
      name: 'comlink',
      minChunks: 2,
    }),
    new UglifyJsPlugin(),
    new BundleAnalyzerPlugin()
  ],
  watch: true,
};
