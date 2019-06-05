'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackInlineSourcePlugin =
    require('html-webpack-inline-source-plugin');
var CSPWebpackPlugin = require('csp-html-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var path = require('path');
var FilterChunkWebpackPlugin = require('filter-chunk-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, options) => {
  var isProd = options.mode === 'production';

  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  var config = {};

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Should be an empty object if it's generating a test build
   * Karma will set this when it's a test build
   */
  config.entry = {app: './app/index.js'};

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Should be an empty object if it's generating a test build
   * Karma will handle setting it up for you when it's a test build
   */
  config.output = {
    // Absolute output directory
    path: __dirname + '/dist',

    // Output path from the view of the page
    // Uses webpack-dev-server in development
    publicPath: '/',

    // Filename for entry points
    // Only adds hash in build mode
    filename: '[name].bundle.js',

    // Filename for non-entry points
    // Only adds hash in build mode
    chunkFilename: '[name].bundle.js'
  };

  /**
   * Loaders
   * Reference:
   * http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */

  // Initialize module
  config.module = {
    rules: [
      {
        // JS LOADER
        // Reference: https://github.com/babel/babel-loader
        // Transpile .js files using babel-loader
        // Compiles ES6 and ES7 into ES5 code
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        // ASSET LOADER
        // Reference: https://github.com/webpack/file-loader
        // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to
        // output
        // Rename the file using the asset hash
        // Pass along the updated reference to your code
        // You can add here any file extension you want to get copied
        // to your output
        // Excludes .svg files in icons directory
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/,
        exclude: /icons\/.*\.svg$/,
        loader: 'file-loader',
        options: {name: '[path][name].[ext]'}
      },
      {
        // INLINE SVG LOADER
        // Inlines .svg assets in icons directory
        // needed specifically for icon-provider.js directive
        test: /icons\/.*\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        // HTML LOADER
        // Reference: https://github.com/webpack/raw-loader
        // Allow loading html through js
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  };

  config.plugins = [
    new HtmlWebpackPlugin({
      template: './app/index.html',
      inject: 'body',
      favicon: './app/assets/images/favicon.ico',
      minify: {removeComments: true, collapseWhitespace: true},

    }),
    new CSPWebpackPlugin({
      'base-uri': '\'self\'',
      'object-src': '\'none\'',
      'script-src': ['\'self\''],
      'style-src': ['\'self\''],
      // KVM requires image buffers from data: payloads, so allow that in
      // img-src
      // https://stackoverflow.com/questions/18447970/content-security-policy-data-not-working-for-base64-images-in-chrome-28
      'img-src': ['\'self\'', 'data:'],
    }),
    new MiniCssExtractPlugin(),

    new FilterChunkWebpackPlugin({
      patterns: [
        '*glyphicons-halflings-regular*.ttf',
        '*glyphicons-halflings-regular*.svg',
        '*glyphicons-halflings-regular*.eot',
        '*glyphicons-halflings-regular*.woff2',
      ]
    })
  ];

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(new CompressionPlugin({deleteOriginalAssets: true}));
  }

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {contentBase: './src/public', stats: 'minimal'};

  return config;
};
