const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode:'development',
  
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    host:'192.168.73.9'
  }

};