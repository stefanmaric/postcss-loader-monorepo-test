const path = require('path')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const safePostCssParser = require('postcss-safe-parser')

const { NODE_ENV } = process.env

const isProduction = NODE_ENV === 'production'
const isDevelopment = NODE_ENV === 'development'

module.exports = {
  mode: isProduction ? 'production' : 'development',
  bail: isProduction,
  devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
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
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        parser: safePostCssParser,
        map: {
          // `inline: false` forces the sourcemap to be output into a
          // separate file
          inline: false,
          // `annotation: true` appends the sourceMappingURL to the end of
          // the css file, helping the browser find the sourcemap
          annotation: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.css$/,
            exclude: /\.module\.css$/,
            loader: [
              isProduction && MiniCssExtractPlugin.loader,
              require.resolve('thread-loader'),
              isDevelopment && require.resolve('style-loader'),
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
                    config: path.resolve(__dirname, '../postcss.config.js'),
                    ident: 'postcss',
                  },
                },
              },
            ].filter(Boolean),
            sideEffects: true,
          },
          {
            test: /\.module\.css$/,
            loader: [
              isProduction && MiniCssExtractPlugin.loader,
              require.resolve('thread-loader'),
              isDevelopment && require.resolve('style-loader'),
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  modules: {
                    localIdentName: isProduction ? '[hash:8]' : '[name]___[local]',
                  },
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  postcssOptions: {
                    config: path.resolve(__dirname, '../postcss.config.js'),
                    ident: 'postcss',
                  },
                },
              },
            ].filter(Boolean),
          },
        ],
      },
    ],
  },
  plugins: [
    isProduction &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[name].[contenthash].chunk.css',
      }),
  ].filter(Boolean),
}
