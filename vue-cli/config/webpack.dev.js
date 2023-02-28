const path = require('path')
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin') 
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require("webpack"); // 定义环境变量，给vue的环境变量中使用 处理警告console。警告提醒

// 配置alias 别名
const resolve = dir => path.resolve(__dirname, dir);

// 合并处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
  return [
    // 'style-loader',
    'vue-style-loader', // 在vue中需要处理vue中样式，需要vue-style-loader
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
    preProcessor
  ].filter(Boolean) // 将数组中的 null undefined，过滤
}

module.exports = {
  entry : './src/main.js', // 打包入口文件 作为webpack打包入口文件
  output: { // 指定输入的文件目录
    path: undefined, // 输出目录，开发模式不需要输出
    filename: 'static/js/[name].js', // 打包输入的的名字
    chunkFilename: 'static/js/[name].chunk.js', // 将代码进行分割打包比如 动态导入import modules打包
    assetModuleFilename: 'static/media/[name].[hash:10][ext][query]' // 打包输入的图片 字体
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
        }
      },
      // 处理的vue中sfc单文件
      {
        test: /\.vue$/,
        loader: 'vue-loader'
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
      favicon: path.resolve(__dirname, '../public/favicon.ico'), // 在这里配置ico图标
    }),
    new VueLoaderPlugin(), // 处理vue单文件
    // DefinePlugin定义环境变量给源代码使用的，解决vue3页面警告问题
    new DefinePlugin({
      __VUE_OPTIONS_API__: "true", // 允许使用option 选项api
      __VUE_PROD_DEVTOOLS__: "false", // 在生产环境下devtools是不出现调试的
    })
  ],
  // 代码分割
  optimization: {
    splitChunks: { // 分割module 以及 import代码
      chunks: "all",
    },
    // 代码分割导致，缓存失效，通过runtimeChunk
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`
    }
  },
  // webpack解析模块的选项，通过import加载是解析选项
  resolve: {// 自动补全文件扩展名，比如 import App from './App' 会先用App.jsx加载，在用app.js加载
    // 设置别名
    alias: {
      '@': resolve('../src'), // 这样配置后 @ 可以指向 src 目录
      '_c': resolve('src/components')
    },
    extensions: [".vue",".ts", ".tsx", ".js", ".jsx"],
  },
  devServer: {
    // open: true,
    host: "localhost",
    port: 3000,
    hot: true, // 开启hrm
    compress: true,
    historyApiFallback: true, // 解决react-router刷新404问题
  },
  mode: 'development',
  devtool: 'cheap-module-source-map' // 包含行/列映射
}