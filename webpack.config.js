const path = require('path');

module.exports = {
  mode: 'development',
  entry: [
    './src/IsoPlugin.js'
  ],
  externals: {
    phaser: 'phaser',
  },
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: /node_modules/, 
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ]
        }
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'phaser-plugin-isometric.js',
    library: 'phaser-plugin-isometric',
    libraryTarget: 'commonjs2'
  }
};

