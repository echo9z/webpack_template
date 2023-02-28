module.exports = {
    // 基础Eslint规则
    root: true,
    env: { // 启用node环境变量
        node: true,
    },
    // 继承vue3官方规则 和 eslint官方规则
    extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
    parserOptions: {
        parser: "@babel/eslint-parser",
    },
    "rules": {
        "no-var": 2, // 不能使用 var定义变量
        "import": 0,
        "no-unused-vars": "off",
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
}