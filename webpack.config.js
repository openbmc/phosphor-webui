'use strict';

// Modules
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

module.exports = [
  function makeWebpackConfig() {
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
    config.entry = isTest ? void 0 : {
      app : './app/index.js'

    };

    /**
     * Output
     * Reference: http://webpack.github.io/docs/configuration.html#output
     * Should be an empty object if it's generating a test build
     * Karma will handle setting it up for you when it's a test build
     */
    config.output = isTest ? {} : {
      // Absolute output directory
      path : __dirname + '/dist',

      // Output path from the view of the page
      // Uses webpack-dev-server in development
      publicPath : '/',

      // Filename for entry points
      // Only adds hash in build mode
      filename : isProd ? '[name].[hash].js' : '[name].bundle.js',

      // Filename for non-entry points
      // Only adds hash in build mode
      chunkFilename : isProd ? '[name].[hash].js' : '[name].bundle.js'
    };

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if (isTest) {
      https:
          // unix.stackexchange.com/questions/144208/find-files-without-extension
          config.devtool = 'inline-source-map';
      }
    else if (isProd) {
      config.devtool = 'source-map';
      }
    else {
      config.devtool = 'eval-source-map';
    }

    /**
     * Loaders
     * Reference:
     * http://webpack.github.io/docs/configuration.html#module-loaders
     * List: http://webpack.github.io/docs/list-of-loaders.html
     * This handles most of the magic responsible for converting modules
     */

    // Initialize module
    config.module = {
      rules : [
        {
          // JS LOADER
          // Reference: https://github.com/babel/babel-loader
          // Transpile .js files using babel-loader
          // Compiles ES6 and ES7 into ES5 code
          test : /\.js$/,
          use : 'babel-loader',
          exclude : /node_modules/
        },
        {
          // CSS LOADER
          // Reference: https://github.com/webpack/css-loader
          // Allow loading css through js
          //
          // Reference: https://github.com/postcss/postcss-loader
          // Postprocess your css with PostCSS plugins
          test : /\.css$/,
          // Reference: https://github.com/webpack/extract-text-webpack-plugin
          // Extract css files in production builds
          //
          // Reference: https://github.com/webpack/style-loader
          // Use style-loader in development.

          loader : isTest ? 'null-loader' : ExtractTextPlugin.extract({
            fallback : 'style-loader',
            use : [
              {loader : 'css-loader', query : {sourceMap : true}},
              {loader : 'postcss-loader'}
            ],
          })
        },
        {
          // ASSET LOADER
          // Reference: https://github.com/webpack/file-loader
          // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to
          // output
          // Rename the file using the asset hash
          // Pass along the updated reference to your code
          // You can add here any file extension you want to get copied to your
          // output
          test : /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/,
          loader : 'file-loader',
          options : {
            name(file) {
              if (!isProd) {
                return '[path][name].[ext]'
                }

              return '[hash].[ext]'
            }
          }
        },
        {
          // HTML LOADER
          // Reference: https://github.com/webpack/raw-loader
          // Allow loading html through js
          test : /\.html$/,
          use : {loader : 'html-loader'}
        },
        // JSON LOADER
        {test : /\.json$/, loader : 'json-loader'}, {
          test : /\.scss$/,
          use : [
            {
              loader : 'style-loader'  // creates style nodes from JS strings
            },
            {
              loader : 'css-loader'  // translates CSS into CommonJS
            },
            {
              loader : 'sass-loader'  // compiles Sass to CSS
            }
          ]
        }
      ]
    };

    // ISTANBUL LOADER
    // https://github.com/deepsweet/istanbul-instrumenter-loader
    // Instrument JS files with istanbul-lib-instrument for subsequent code
    // coverage reporting
    // Skips node_modules and files that end with .spec.js
    if (isTest) {
      config.module.rules.push({
        enforce : 'pre',
        test : /\.js$/,
        exclude : [ /node_modules/, /\.spec\.js$/],
        loader : 'istanbul-instrumenter-loader',
        query : {esModules : true}
      })
    }

    /**
     * PostCSS
     * Reference: https://github.com/postcss/autoprefixer-core
     * Add vendor prefixes to your css
     */
    // NOTE: This is now handled in the `postcss.config.js`
    //       webpack2 has some issues, making the config file necessary

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [ new webpack.LoaderOptionsPlugin({
      test : /\.scss$/i,
      options : {postcss : {plugins : [ autoprefixer ]}},
      debug : !isProd
    }) ];

    // Skip rendering index.html in test mode
    if (!isTest) {
      // Reference: https://github.com/ampedandwired/html-webpack-plugin
      // Render index.html
      config.plugins.push(
          new HtmlWebpackPlugin(
              {
                template : './app/index.html',
                inject : 'body',
                favicon: './app/assets/images/favicon.ico'
              }),

          // Reference: https://github.com/webpack/extract-text-webpack-plugin
          // Extract css files
          // Disabled when in test mode or not in build mode
          new ExtractTextPlugin({
            filename : 'css/[name].css',
            disable : !isProd,
            allChunks : true
          }))
      }

    // Add build specific plugins
    if (isProd) {
      config.plugins.push(
          // Reference:
          // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
          // Minify all javascript, switch loaders to minimizing mode
          // TODO: openbmc/openbmc#2871  Mangling currently breaks the GUI.
          new UglifyJsPlugin({
            uglifyOptions:{
              mangle: false
            }
          }),

          // Copy assets from the public folder
          // Reference: https://github.com/kevlened/copy-webpack-plugin
          new CopyWebpackPlugin([ {from : __dirname + '/app/assets'} ]),
          new CompressionPlugin({deleteOriginalAssets : true}))
    }

    /**
     * Dev server configuration
     * Reference: http://webpack.github.io/docs/configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    config.devServer = {contentBase : './src/public', stats : 'minimal'};

    return config;
  }()];
