const os = require('os') // 系统模块 os
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

// cpu核数
const threads = os.cpus().length

module.exports = {
  // 入口 相对路径
  entry: './src/main.js', // 查找根目录下的src
  // 输出
  output: {
    // 所有文件打包都会在这么目录下，文件的输出路径
    // path: path.resolve(__dirname, '../dist'), // 路径拼接 __dirname目录当前文件路径+dist
    path: undefined, // 开发环境不需要在输出，是在内存中编译的
    // 处理js文件，入口文件打包输出到文件名中
    filename: 'static/js/[name].js', // 输出文件名称，如果是多入口文件直接写为main.js就是有问题的，打包的资源以文件命名方式输出
    chunkFilename: 'static/js/[name].chunk.js', // 打包输出的其他文件 import(/* webpackChunkName: "math" */ './js/math')
    // assetModuleFilename: 'static/media/[name].[hash:8][ext]', // 图片、字体等资源统一处理命名方式，统一处理
    // 清空上一次打包结果，在webpack4中使用clean-webpack-plugin
    clean: true, // 打包前，将path整个目录内容清空，在进行打包
  },
  // 加载器
  module: {
    rules: [
      {
        // loader的配置
        oneOf: [
          {
            // 用来匹配 .css 结尾的文件
            test: /\.css$/,
            // use 数组里面 Loader 执行顺序是从右到左
            use: [
              "style-loader", // 将js中的css通过创建style标签添加到html中
              "css-loader" // css资源编译commonjs的模块到js中
            ],
          },
          {
            test: /\.less$/,
            // loader: 'xxx' 只能使用一个loader加载器
            use: [
              'style-loader',
              'css-loader',
              'less-loader', // 将less编译成css文件
            ],
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader', // 将sass编译成css文件
            ],
          },
          {
            test: /\.styl$/,
            use: [
              'style-loader',
              'css-loader',
              'stylus-loader', // 将stylus编译成css文件
            ],
          },
          { // 处理图片
            test: /\.(png|jpe?g|gif|webp)$/,
            type: "asset", // 会将文件转base64
            parser: {
              dataUrlCondition: { // 小于10kb 将图片转换为base64格式
                maxSize: 10 * 1024 // 10kb
              }
            },
            generator: { // 输入文件的名称 hash值名称:10只取前10位+文件扩展名+一些查询参数
              // 将图片文件输出到 static/imgs 目录中
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
      context: path.resolve(__dirname, '../src'), // 在config中，需要退回到上一层
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
    })
  ],
  // 代码分割
  optimization: {
    splitChunks: { // 分割module 以及 import代码
      chunks: all
    },
    // 代码分割导致，缓存失效，通过runtimeChunk
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    }
  },
  // 开发服务器：不会输出资源，在内存中编译打包的
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
    // css 样式经过 style-loader 处理，已经具备 HMR 功能了。 但是 js 还不行。
    hot: true, // 是否开启，更新某个文件或者模块进行热更新，false为整项目重启打包
  },
  // 模式
  mode: 'development',
  devtool: 'cheap-module-source-map' // 低开销的 被简化为每行一个映射，只包含行映射
}