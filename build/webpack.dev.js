const merge = require('webpack-merge')
const commonConfig = require('./webpack.common')
const webpack = require('webpack')

const config = {
  mode: "development",
  // https://www.webpackjs.com/configuration/devtool/
  devtool: "cheap-module-eval-source-map",
  devServer: {
    host: '0.0.0.0',
    contentBase: './dist',
    open: false,
    hot: true, // HMR
    // hotOnly: true // HMR开启时 不要自动刷新
    proxy: {
      '/bing': {
        target: 'http://www.bing.com',
        changeOrigin: true,
        pathRewrite: {
          '^/bing': '/'
        }
      }
    },
  },
  output: {
    publicPath: "/", // for dev server
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  optimization: {
    usedExports: true
  }
}

module.exports = merge(commonConfig, config)
