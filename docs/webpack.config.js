const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    projection: './src/IsoProjectionExample.js',
    collision: './src/IsoCollisionExample.js',
    interaction: './src/IsoInteractionExample.js'
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
      },
      { test: [/\.vert$/, /\.frag$/], use: 'raw-loader' }
    ]
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/phaser3-plugin-isometric/dist',
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      WEBGL_RENDERER: true,
      CANVAS_RENDERER: true
    })
  ],
  devServer: {
    contentBase: __dirname,
    publicPath: '/dist'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
          minSize: 0
        }
      }
    },
    occurrenceOrder: true 
  }
};

