const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { merge } = require('webpack-merge');
const NODE_ENV = process.env.NODE_ENV;
const { version } = require('./package.json');
const { features } = require('process');
const resolve = (p) => {
  return path.resolve(__dirname, p);
};
const commonConfig = {
  //The base directory, an absolute path, for resolving entry points and loaders from configuration.
  context: path.join(__dirname, '/src'),

  entry: {
    background: "<%- features.includes('ts') ?  './background.ts' : './background.js' %>",
    'popup/popup': './popup/popup.js',
    'options/options': './options/options.js',
    content: "<%- features.includes('ts') ?  './content.ts' : './content.js' %>"
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.vue', '.js', '.jsx', '.scss'],
    alias: {
      components: resolve('./src/common/components'),
      features: resolve('./src/features'),
      utils: resolve('./src/utils')
    }
  },
  module: {
    rules: [<%_ if(features.includes('framework') &&  useFramework=== 'vue') { %>
        {
          test: /\.vue$/,
          loaders: 'vue-loader',
          options: {
            postcss: [require('postcss-preset-env')()]
          }
        },
      <% } _%>
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        include: [resolve(__dirname, 'src')],
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /.jsx?$/,
        include: [resolve(__dirname, 'src')],
        exclude: [resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
        query: {
          presets: [
            [
              '@babel/env',
              {
                targets: {
                  browsers: 'last 2 chrome versions'
                }
              }
            ]
          ]
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        include: [resolve(__dirname, 'src')],
        options: {
          name: '[name].[ext]',
          outputPath: '/images/',
          emitFile: false
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          {
            loader: 'css-loader',
            options: {
              // Run `postcss-loader` on each CSS `@import`, do not forget that `sass-loader` compile non CSS `@import`'s into a single file
              // If you need run `sass-loader` and `postcss-loader` on each CSS `@import` please set it to `2`
              importLoaders: 1,
              // Automatically enable css modules for files satisfying `/\.module\.\w+$/i` RegExp.
              modules: { auto: true }
            }
          },
          'postcss-loader',
          '<%- cssPreprocessor %>'
        ]
      }
    ]
  },

  optimization: {
    splitChunks: {
      minChunks: 2, //当一个模块至少引入多少次，才进行代码分割
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/](node_modules|src\/_locales)[\\/]/,
          chunks: 'all',
          minChunks: 1
        }
      }
    },
    nodeEnv: 'production'
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].chunk.css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'assets',
          to: 'assets'
        },
        {
          from: 'manifest.json',
          to: 'manifest.json',
          transform: (content) => {
            const jsonContent = JSON.parse(content);
            jsonContent.version = version;

            if (NODE_ENV === 'development') {
              jsonContent.content_security_policy = "script-src 'self' 'unsafe-eval'; object-src 'self'";
            }

            return JSON.stringify(jsonContent, null, 2);
          }
        }
      ]
    }),   <%_ if(pages.includes('popup')) { %>
      new HtmlWebpackPlugin({
        template: 'popup/index.html',
        filename: 'popup/index.html',
        chunks: ['popup/popup', 'vendors']
      }), <% } _%>
    <% if(pages.includes('options')) { _%>
      new HtmlWebpackPlugin({
        template: 'options/index.html',
        filename: 'options/index.html',
        chunks: ['options/options', 'vendors']
      })
      <% } _%>
  ]
};

const productionConfig = {
  mode: 'production'
};

const developmentConfig = {
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, '/dist/'),
    inline: true,
    host: 'localhost',
    port: 8080
  }
};

module.exports = () => {
  switch (NODE_ENV) {
    case 'development':
      return merge(commonConfig, developmentConfig);
    case 'production':
      return merge(commonConfig, productionConfig);
    default:
      throw new Error('No matching configuration was found!');
  }
};
