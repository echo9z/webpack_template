import { createApp } from 'vue'
import App from './App'
import router from './router'
// ElementPuls全量导入
// import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App)
.use(router)
// .use(ElementPlus)
.mount('#app')