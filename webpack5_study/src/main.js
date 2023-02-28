import 'core-js/es/promise'
// webpack 必须引入，才会做打包处理
import count from './js/count'
import sum from './js/sum'
// import { mul } from './js/math'
import './css/index.css'
import './less/index.less'

import './sass/index1.sass'
import './sass/index2.scss'
import './styl/index.styl'
// 架子字体文件
import './css/fontello.css'

let res = 5
console.log(res)
console.log(count(15,24), sum(15,10,6))

// console.log(mul(15,2)) // 只用到了mul函数，只会将mul函数进行打包，对math中中的其他代码不进行打包
document.querySelector('#btn').onclick = () => {
  // eslint会对动态导入语法报错，需要修改eslint配置文件 "import": 3
  // webpackChunkName: "math"：这是webpack动态导入模块命名的方式
  // "math"将来就会作为[name]的值显示。
  import(/* webpackChunkName: "math" */ './js/math').then(( { mul } ) => {
    console.log(mul(15,20))
  })
}

if (module.hot) { // 判断是否支持热模块替换，有的低版本浏览器不支持
  // 当count 和 sum文件更新后，只更新这两个模块
  module.hot.accept('./js/count', () => { // 文件更新，执行回调函数
    console.log('热替换count')
  })
  module.hot.accept('./js/sum')
}

// let arr = [ { id:1, children: {id: 3, children: {} } }, {}, {}]
new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('ok')
  } ,1000)
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
