const path = require('path');

module.exports = {
  entry: {
    main: './src/main.js',
    worker: './src/worker.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve('./dist')
  },
  resolve: {
    alias: {
        '': path.resolve('./src')
    }
}};
