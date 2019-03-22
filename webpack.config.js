const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode:'production',
  optimization: {
    minimize: true
  },
  output: {
    filename: 'graph.js',
    path: path.resolve(__dirname, 'dist')
  },
  watch: true,
  devtool: false
};