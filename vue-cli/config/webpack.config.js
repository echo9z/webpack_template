const path = require('path')
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin') 
const MiniCssExtractPlugin = require("mini-css-extract-plugin") // 将css单独处理成文件，link标签进行引入
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin') // 压缩 CSS
const TerserWebpackPlugin = require('terser-webpack-plugin') // webpack内置的，js代码压缩
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'); // 对图片进行无损压缩
const CopyPlugin = require("copy-webpack-plugin"); // 将public下的相关资源复制到dist目录下
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require("webpack"); // 定义环境变量，给vue的环境变量中使用 处理警告console。警告提醒

const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

// 获取cross-env 定义的环境变量
const isProduction = process.env.NODE_ENV === 'production'
// 配置alias 别名
const resolve = dir => path.resolve(__dirname, dir);

// 合并处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
  return [
    // 'style-loader',
    isProduction ? MiniCssExtractPlugin.loader: 'vue-style-loader',
    'css-loader',
    { // 配置项写为{},不写配置项则为"postcss-loader"即可
      loader: "postcss-loader", // 处理兼容性问题，配合package.json中的browserslist兼容浏览器样式，兼容到什么程度 
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题 什么浏览器前缀
          ],
        },
      },
    },
    // 传入的loader 是否存在
    preProcessor && {
      loader: preProcessor,
      options: preProcessor === 'sass-loader' ? 
        { additionalData: `@use "@/styles/element/index.scss" as *;` } : {},
    }
  ].filter(Boolean) // 将数组中的 null undefined，过滤
}

module.exports = {
  entry : './src/main.js', // 打包入口文件 作为webpack打包入口文件
  output: { // 指定输入的文件目录
    path: isProduction ? path.resolve(__dirname, '../dist') : undefined, // 输出目录，开发模式不需要输出
    filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js', // 打包输入的的名字
    chunkFilename: isProduction ? 'static/js/[name].[contenthash:10].chunk.js' : 'static/js/[name].chunk.js', // 将代码进行分割打包比如 动态导入import modules打包
    assetModuleFilename: 'static/media/[name].[hash:10][ext][query]', // 打包输入的图片 字体
    clean: true // 清除上次打包目录
  },
  module: {
    rules: [
      // 处理css
      {
        test: /\.css/,
        // 将css通过link方式引入
        use: getStyleLoaders(), 
      },
      {
        test: /\.less/,
        use: getStyleLoaders('less-loader'), 
      },
      {
        test: /\.s[ac]ss$/,
        use: getStyleLoaders('sass-loader') // 将sass编译成css文件
      },
      {
        test: /\.styl$/,
        use: getStyleLoaders('stylus-loader')  // 将stylus编译成css文件
      },
      // 处理图片
      { // 处理图片
        test: /\.(png|jpe?g|gif|webp|svg)$/,
        type: "asset", // 会将文件转base64
        parser: {
          dataUrlCondition: { // 小于10kb 将图片转换为base64格式
            maxSize: 10 * 1024 // 10kb
          }
        },
        // generator: { // 输入文件的名称 hash值名称:10只取前10位+文件扩展名+一些查询参数
        //   filename: 'static/images/[name].[hash:8][ext][query]' 
        // }
      },
      // 处理字体
      {
        test: /\.(ttf|woff2?)$/,
        type: "asset/resource", // 对原封的文件输出
      },
      // 处理js
      {
        test: /\.(jsx|js)$/,
        include: path.resolve(__dirname, "../src"),
        loader: "babel-loader",
        options: {
          cacheDirectory: true, // 开启babel缓存
          cacheCompression: false, // 关闭缓存文件压缩，会生成一些缓存文件，如果对缓存的文件进行压缩打包速度就会慢些
          // plugins: ['react-refresh/babel'] // 激活js的hmr热更新
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // 开启缓存，第二次打包更快
          cacheDirectory: path.resolve(__dirname, '../node-modules/.cache/vue-loader')
        }
      }
    ]
  },
  // 处理html
  plugins: [
    new ESLintWebpackPlugin({
      // 只对src进行 eslint格式效验
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules', // 不写，默认也是node_modules不去处理
      cache: true,
      // 缓存目录 node_modules 下的.cache
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
      // threads // 开启多进程 和 进程数 
    }),
    new HtmlWebpackPlugin({
      // 模板：以public/index.html文件创建新的html文件
      template: path.resolve(__dirname, '../public/index.html'),
      // favicon: path.resolve(__dirname, '../public/favicon.ico'), // 在这里配置ico图标
    }),
    isProduction && new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css', // 会将所有资源打包到 main.css文件中，通过link标签形式
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css', // 如果main.js中 动态的导入css文件import('./js/test.css')
    }),
    isProduction && new CopyPlugin({
      patterns: [
        // 将public目录中的资源复制 到dist目录中去
        { 
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          globOptions: {
            // 忽略public下的index.html
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new VueLoaderPlugin(), // 处理vue单文件
    // DefinePlugin定义环境变量给源代码使用的，解决vue3页面警告问题
    new DefinePlugin({
      __VUE_OPTIONS_API__: "true", // 允许使用option 选项api
      __VUE_PROD_DEVTOOLS__: "false", // 在生产环境下devtools是不出现调试的
    }),
    // 按需加载ElementPlus
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({
        // 自定义主题，引入sass
        importStyle: "sass",
      })],
    }),
  ].filter(Boolean),
  // 代码分割
  optimization: {
    // 是否需要进行压缩，为false 下面的minimizer选项都不会生效
    minimize: isProduction,
    minimizer: [
      // css压缩
      new CssMinimizerPlugin(),
      new TerserWebpackPlugin(), // js压缩
      // 压缩图片
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    splitChunks: { // 分割module 以及 import代码
      chunks: "all",
      // 将.vue 进行分割打包
      cacheGroups: {
        // layouts通常是admin项目的主体布局组件，所有路由组件都要使用的
        // 可以单独打包，从而复用
        // 如果项目中没有，请删除
        layouts: {
          name: "layouts",
          test: path.resolve(__dirname, "../src/layouts"),
          priority: 40,
        },
        // 将vue相关的库单独打包，减少node_modules的chunk体积。
        vue: {
          name: "vue-chunk",
          test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
          chunks: "initial",
          priority: 30,
        },
        // 如果项目中使用element-plus，此时将所有node_modules打包在一起，那么打包输出文件会比较大。
        // 所以我们将node_modules中比较大的模块单独打包，从而并行加载速度更好
        // 如果项目中没有，请删除
        elementPlus: {
          name: "elementPlus-chunk",
          test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          priority: 20,
        },
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10, // 权重最低，优先考虑前面内容
          chunks: "initial",
        }
      }
    },
    // 代码分割导致，缓存失效，通过runtimeChunk
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    },
  },
  // webpack解析模块的选项，通过import加载是解析选项
  resolve: {
    // 设置别名
    alias: {
      '@': resolve('../src'), // 这样配置后 @ 可以指向 src 目录
      '_c': resolve('src/components')
    },
    // 自动补全文件扩展名，比如 import App from './App' 会先用App.jsx加载，在用app.js加载
    extensions: [".vue", ".ts", ".tsx", ".js", ".jsx"],
  },
  devServer: { // 在运行的时候如果不加server 就不会激活devServer选项
    // open: true,
    host: "localhost",
    port: 3000,
    hot: true, // 开启hrm
    compress: true,
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "cheap-module-source-map", // 包含行/列映射
}