const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode:'development',
  output: {
    filename: 'graph.js',
    path: path.resolve(__dirname, 'dist')
  },
  watch: true,
  devtool: 'source-map'
};