module.exports = {
    "env": {
        "browser": true, // 启用node中的全局变量
        "es2021": true,
        "node": true // 启用浏览器中的全局变量
    },
    // 基础Eslint规则
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": 6, // 语法版本使用最新版本
        "sourceType": "module" // es 模块
    },
    "rules": {
        "no-var": 2, // 不能使用 var定义变量
        "import": 3
    }
}
