const path = require('path');
const webpack = require('webpack');
const copy = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  entry: {
    main: './src/main.js',
    worker: './src/worker.js'
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
      }
    ]
  },
  plugins: [
    new copy([
      {from: './src/index.html'}
    ]),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'common',
    //   filenake: 'common.js',
    //   // children: true,
    //   // deepChildren: true,
    // }),
    // new BundleAnalyzerPlugin()
  ],
  watch: true,
};
