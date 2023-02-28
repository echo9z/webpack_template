import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // 一级路由布局容器
  {
    path: '/',
    component: () => import('@/views/Layout'),
    children: [
      { path: '/home', component: () => import('@/views/Home') },
      { path: '/about', component: () => import('@/views/About') }
    ]
  }
]

const router = createRouter({
  // history: createWebHistory(), // 使用历史history路由模式
  history: createWebHashHistory(), // 使用历史hash路由模式
  routes,
  // linkExactActiveClass: 'active', // 配置全局router 激活类名
  // 路由在进行跳转切换时，进入新的页面始终滚动到顶部
  // https://router.vuejs.org/zh/guide/advanced/scroll-behavior.html
  scrollBehavior () {
    // 始终滚动到顶部
    // vu2.0 x 和 y
    // vu3.0 left 和 top
    return { left: 0, top: 0 }
  }
})

// 前置导航守卫导航
router.beforeEach((to, from, next) => {
  // 其他放行
  next()
})

export default router