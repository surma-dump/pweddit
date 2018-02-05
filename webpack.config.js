const path = require('path');
const copy = require('copy-webpack-plugin');

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
    ])
  ]
};
