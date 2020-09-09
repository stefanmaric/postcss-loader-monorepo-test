const path = require('path')

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { NODE_ENV } = process.env

const isProduction = NODE_ENV === 'production'

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: {
    main: path.resolve(__dirname, 'index.js'),
  },
  output: {
    path: path.resolve(__dirname, '_build/'),
    filename: isProduction ? 'static/js/[name].[hash].js' : 'static/js/[name].js',
    chunkFilename: isProduction
      ? 'static/js/[name].[chunkhash].chunk.js'
      : 'static/js/[name].chunk.js',
    futureEmitAssets: true,
    publicPath: '/',
  },
  optimization: {
    minimize: isProduction,
    minimizer: [new CssMinimizerPlugin()],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            loader: [
              isProduction ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
              require.resolve('thread-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  postcssOptions: {
                    config: path.resolve(__dirname, '../'),
                  },
                },
              },
            ],
            sideEffects: true,
          },
        ],
      },
    ],
  },
  plugins: [isProduction && new MiniCssExtractPlugin()].filter(Boolean),
}
