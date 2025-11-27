// Webpack optimization configuration for Spark Frontend

const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Performance optimization configuration
const performanceOptimizations = {
  // Split chunks optimization
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // Vendor chunks
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true
      },
      // React chunks
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        chunks: 'all',
        priority: 20,
        reuseExistingChunk: true
      },
      // Ant Design chunks
      antd: {
        test: /[\\/]node_modules[\\/]@ant-design[\\/]/,
        name: 'antd',
        chunks: 'all',
        priority: 20,
        reuseExistingChunk: true
      },
      // Common chunks
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5,
        reuseExistingChunk: true
      }
    }
  },

  // Runtime chunk optimization
  runtimeChunk: {
    name: 'runtime'
  },

  // Module concatenation
  concatenateModules: true,

  // Side effects optimization
  sideEffects: false,

  // Used exports optimization
  usedExports: true,

  // Tree shaking
  providedExports: true,

  // Module IDs optimization
  moduleIds: 'deterministic',
  chunkIds: 'deterministic'
};

// Compression optimization
const compressionOptimizations = {
  // Gzip compression
  gzip: new CompressionPlugin({
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/,
    threshold: 8192,
    minRatio: 0.8,
    deleteOriginalAssets: false
  }),

  // Brotli compression
  brotli: new CompressionPlugin({
    algorithm: 'brotliCompress',
    test: /\.(js|css|html|svg)$/,
    threshold: 8192,
    minRatio: 0.8,
    deleteOriginalAssets: false,
    filename: '[path][base].br'
  })
};

// CSS optimization
const cssOptimizations = {
  // Extract CSS
  extractCSS: new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
    chunkFilename: 'css/[name].[contenthash:8].chunk.css'
  }),

  // CSS minimizer
  cssMinimizer: new CssMinimizerPlugin({
    minimizerOptions: {
      preset: [
        'default',
        {
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          colormin: true,
          minifySelectors: true
        }
      ]
    }
  })
};

// JavaScript optimization
const jsOptimizations = {
  // Terser plugin for minification
  terser: new TerserPlugin({
    terserOptions: {
      parse: {
        ecma: 8
      },
      compress: {
        ecma: 5,
        warnings: false,
        comparisons: false,
        inline: 2,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      },
      output: {
        ecma: 5,
        comments: false,
        ascii_only: true
      }
    },
    parallel: true,
    extractComments: false
  }),

  // Tree shaking
  treeShaking: {
    usedExports: true,
    sideEffects: false
  }
};

// Bundle analysis
const bundleAnalysis = {
  // Bundle analyzer
  analyzer: new BundleAnalyzerPlugin({
    analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
    openAnalyzer: false,
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
    reportFilename: 'bundle-report.html'
  }),

  // Bundle size limits
  sizeLimits: {
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 512000, // 500KB
    hints: 'warning'
  }
};

// Development optimizations
const developmentOptimizations = {
  // Hot module replacement
  hmr: new webpack.HotModuleReplacementPlugin(),

  // Named modules
  namedModules: true,

  // Source maps
  sourceMaps: 'eval-source-map',

  // Development server
  devServer: {
    hot: true,
    compress: true,
    historyApiFallback: true,
    overlay: true,
    stats: 'minimal'
  }
};

// Production optimizations
const productionOptimizations = {
  // Source maps
  sourceMaps: 'source-map',

  // Module concatenation
  concatenateModules: true,

  // Side effects
  sideEffects: false,

  // Used exports
  usedExports: true,

  // Tree shaking
  providedExports: true,

  // Module IDs
  moduleIds: 'deterministic',
  chunkIds: 'deterministic'
};

// Performance monitoring
const performanceMonitoring = {
  // Performance hints
  hints: process.env.NODE_ENV === 'production' ? 'warning' : false,

  // Asset size limits
  assetFilter: (assetFilename) => {
    return !assetFilename.endsWith('.map');
  },

  // Entry point size limits
  maxEntrypointSize: 512000, // 500KB
  maxAssetSize: 512000 // 500KB
};

// Webpack optimization configuration
const webpackOptimizations = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';

  return {
    // Performance optimizations
    ...performanceOptimizations,

    // Performance monitoring
    performance: performanceMonitoring,

    // Optimization configuration
    optimization: {
      // Split chunks
      splitChunks: performanceOptimizations.splitChunks,

      // Runtime chunk
      runtimeChunk: performanceOptimizations.runtimeChunk,

      // Module concatenation
      concatenateModules: isProduction ? productionOptimizations.concatenateModules : false,

      // Side effects
      sideEffects: isProduction ? productionOptimizations.sideEffects : false,

      // Used exports
      usedExports: isProduction ? productionOptimizations.usedExports : false,

      // Tree shaking
      providedExports: isProduction ? productionOptimizations.providedExports : false,

      // Module IDs
      moduleIds: isProduction ? productionOptimizations.moduleIds : 'named',
      chunkIds: isProduction ? productionOptimizations.chunkIds : 'named',

      // Minimizers
      minimizer: isProduction ? [
        jsOptimizations.terser,
        cssOptimizations.cssMinimizer
      ] : [],

      // Used exports
      usedExports: isProduction,

      // Side effects
      sideEffects: isProduction
    },

    // Plugins
    plugins: [
      // CSS extraction
      cssOptimizations.extractCSS,

      // Compression
      ...(isProduction ? [
        compressionOptimizations.gzip,
        compressionOptimizations.brotli
      ] : []),

      // Bundle analysis
      bundleAnalysis.analyzer,

      // Development plugins
      ...(isDevelopment ? [
        developmentOptimizations.hmr
      ] : []),

      // Environment variables
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.ANALYZE': JSON.stringify(process.env.ANALYZE)
      }),

      // Module concatenation
      ...(isProduction ? [
        new webpack.optimize.ModuleConcatenationPlugin()
      ] : [])
    ],

    // Module rules
    module: {
      rules: [
        // CSS optimization
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer'),
                    require('cssnano')({
                      preset: 'default'
                    })
                  ]
                }
              }
            }
          ]
        },

        // JavaScript optimization
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
                  },
                  modules: false
                }],
                '@babel/preset-react'
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-syntax-dynamic-import',
                ...(isProduction ? [
                  '@babel/plugin-transform-runtime'
                ] : [])
              ]
            }
          }
        }
      ]
    },

    // Resolve optimization
    resolve: {
      // Alias for shorter imports
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@optimizations': path.resolve(__dirname, 'src/optimizations')
      },

      // Extensions
      extensions: ['.js', '.jsx', '.json', '.css'],

      // Modules
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules'
      ]
    },

    // Devtool
    devtool: isProduction ? productionOptimizations.sourceMaps : developmentOptimizations.sourceMaps,

    // Stats
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      ...(isDevelopment ? {
        modules: true,
        children: true,
        chunks: true,
        chunkModules: true
      } : {})
    }
  };
};

module.exports = webpackOptimizations;