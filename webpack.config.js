const path = require('path');
const webpack = require('webpack');
const copy = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;



module.exports = {
  entry: {
    main: './src/main.js',
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
      {
        test: /worker\.js$/,
        use: [
          'worker-loader'
        ]
      }
    ]
  },
  plugins: [
    new copy([
      {from: './src/index.html'}
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      async: true,
      minChunks: 2,
    }),
    new BundleAnalyzerPlugin()
  ],
  watch: true,
};
