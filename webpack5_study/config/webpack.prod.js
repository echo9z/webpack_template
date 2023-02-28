const os = require('os') // 系统模块 os
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 将js文件，script标签自动引入到html中
const MiniCssExtractPlugin = require("mini-css-extract-plugin") // 将css单独处理成文件，link标签进行引入
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin') // 压缩 CSS
const TerserWebpackPlugin = require('terser-webpack-plugin') // webpack内置的，js代码压缩
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'); // 对图片进行无损压缩
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin"); // Preload 浏览器立即加载资源。只加载当前页面的资源
const WorkboxPlugin = require('workbox-webpack-plugin'); // 在页面离线时，可以进行页面浏览

// cpu核数
const threads = os.cpus().length

// 合并处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
  return [
    MiniCssExtractPlugin.loader,
    'css-loader',
    { // 配置项写为{},不写配置项则为"postcss-loader"即可
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题 什么浏览器前缀
          ],
        },
      },
    },
    preProcessor
  ].filter(Boolean) // 将数组中的 null undefined，过滤
}

module.exports = {
  // 入口 相对路径
  entry: './src/main.js',
  // 输出
  output: {
    // 所有文件打包都会在这么目录下，文件的输出路径
    path: path.resolve(__dirname, '../dist'), // 路径拼接 __dirname目录当前文件路径+dist
    // 处理js文件，入口文件打包输出到文件名中
    // [contenthash:8]使用contenthash，取8位长度
    filename: 'static/js/[name].[contenthash:8].js', //入口文件打包输出资源命名方式 输出文件名称，如果是多入口文件直接写为main.js就是有问题的，打包的资源以文件命名方式输出
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js', //动态导入输出资源命名方式 打包输出的其他文件 import(/* webpackChunkName: "math" */ './js/math')
    // assetModuleFilename: 'static/media/[name].[hash:8][ext]', // 图片、字体等资源统一处理命名方式，统一处理
    // 清空上一次打包结果，在webpack4中使用clean-webpack-plugin
    clean: true, // 打包前，将path整个目录内容清空，在进行打包
  },
  // 加载器
  module: {
    rules: [
      // loader的配置
      {
        // 每个文件只能被其中一个loader配置处理，如果被处理到，则后面loader就不被处理
        oneOf: [
          {
            // 用来匹配 .css 结尾的文件
            test: /\.css$/,
            // use 数组里面 Loader 执行顺序是从右到左
            use: getStyleLoaders()
          },
          {
            test: /\.less$/,
            // loader: 'xxx' 只能使用一个loader加载器
            use: getStyleLoaders('less-loader')  // 将less编译成css文件
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader') // 将sass编译成css文件
          },
          {
            test: /\.styl$/,
            use: getStyleLoaders('stylus-loader')  // 将stylus编译成css文件
          },
          { // 处理图片
            test: /\.(png|jpe?g|gif|webp|svg)$/,
            type: "asset", // 会将文件转base64
            parser: {
              dataUrlCondition: { // 小于10kb 将图片转换为base64格式
                maxSize: 10 * 1024 // 10kb
              }
            },
            generator: { // 输入文件的名称 hash值名称:10只取前10位+文件扩展名+一些查询参数
              // 将图片文件输出到 static/images 目录中
              // 将图片文件命名 [hash:8][ext][query]
              // [hash:8]: hash值取8位
              // [ext]: 使用之前的文件扩展名
              // [query]: 添加之前的query参数
              filename: 'static/images/[name].[hash:8][ext][query]'
            }
          },
          { // 处理字体图标
            test: /\.(eot|svg|ttf|woff2?)$/,
            type: "asset/resource", // 对原封的文件输出
            generator: {
              filename: "static/fonts/[name].[hash:8][ext][query]",
            },
          },
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/, // 排除node_modules文件不做es语法转换
            // include: path.resolve(__dirname, '../src/'), // 只处理sr下的文件，其他文件不处理
            use: [
              { // 开启多进程，进行打包
                loader: 'thread-loader',
                options: {
                  works: threads // 进程数
                }
              },
              { // 高级语法转为es5
                loader: 'babel-loader',
                options: {
                  // presets: ['@babel/preset-env']
                  cacheDirectory: true, // 开启babel缓存
                  cacheCompression: false, // 关闭缓存文件压缩，会生成一些缓存文件，如果对缓存的文件进行压缩打包速度就会慢些
                  plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                }
              }
            ]
          },
        ]
      }
    ],
  },
  // 插件
  plugins: [
    // plugins 插件配置
    new ESLintPlugin({
      // 只对src进行 eslint格式效验
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules', // 不写，默认也是node_modules不去处理
      cache: true,
      // 缓存目录 node_modules 下的.cache
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
      threads // 开启多进程 和 进程数 
    }),
    new HtmlWebpackPlugin({
      // 模板：以public/index.html文件创建新的html文件
      // 新文件：1.结构和原来一样 2.自动引入打包输入的资源
      template: path.resolve(__dirname, '../public/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css', // 会将所有资源打包到 main.css文件中，通过link标签形式
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css', // 如果main.js中 动态的导入css文件import('./js/test.css')
    }),
    /*// css压缩
    new CssMinimizerPlugin(),
    // 多进程代码压缩
    new TerserWebpackPlugin({
      parallel: threads
    }), */
    // 
    new PreloadWebpackPlugin({
      rel: "preload", // js用preload方式加载 preload兼容性更好
      as: "script", // script标签加载资源优先级最高 或者 as: "style"样式加载资源最高
      // rel: 'prefetch' // prefetch兼容性更差
    }),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  // 开发服务器：不会输出资源，在内存中编译打包的 生产模式不需要devServer
  /*devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
  },*/
  optimization: {
    // webpack 压缩配置，放在 optimization
    minimizer: [
      // css压缩
      new CssMinimizerPlugin(),
      // 多进程代码压缩
      new TerserWebpackPlugin({ // 在生产模式下，会自动启动该插件，手动添加是配置多进程压缩
        parallel: threads
      }),
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
    // 代码分割配置 开发时我们可能是单页面应用（SPA），只有一个入口（单入口）。那么我们需要这样配置：只需要配置chunks:'all'
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
      /* 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      // cacheGroups: { // 组，哪些模块要打包到一个组
      //   defaultVendors: { // 组名
      //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
      //     priority: -10, // 权重（越大越高）
      //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
      //   },
      //   default: { // 其他没有写的配置会使用上面的默认值
      //     minChunks: 2, // 这里的minChunks权重更大
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // }, 
      */
    },
    // 运行时用于加载 缓存的splitChunks文件，比a.js文件中引用b文件，b文件发生了修改，会导致浏览器缓存失效
    // 通过runtimeChunk
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    }
  },
  // 模式
  mode: 'production',
  devtool: 'source-map' // 包含行/列映射
}