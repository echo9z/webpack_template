module.exports = {
    // 基础Eslint规则
    "extends": ["react-app"], // 继承 react 官方规则
    "parserOptions": {
        "babelOptions": {
            "presets": [
                // 解决页面报错问题
                ["babel-preset-react-app", false],
                "babel-preset-react-app/prod",
            ],
        },
    },
    "rules": {
        "no-var": 2, // 不能使用 var定义变量
        "import": 0,
        "no-unused-vars": "off"
    }
}
