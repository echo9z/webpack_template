module.exports = {
  // 智能预设 babel提供，能编译es6语法
  presets: [
    [
      '@babel/preset-env',
      // 按需加载core-js的polyfill
      { useBuiltIns: "usage", corejs: { version: "3", proposals: true } },
    ]
  ]
}