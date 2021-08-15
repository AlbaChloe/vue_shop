import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)


const router = new VueRouter({
  routes: [
    { // 重定向到登录页
      path: '/',
      redirect: '/login'
    }
    ,
    { // 登录页
      path: '/login',
      component: Login
    },
    { // 首页
      path: '/home',
      component: Home,
      redirect: '/welcome',
      // 首页的嵌套路由
      children: [
        { // 重定向的welcome页面
          path: '/welcome',
          component: Welcome
        },
        { // 用户列表页面
          path: '/users',
          component: Users
        },
        { // 权限管理界面
          path: '/rights',
          component: Rights
        },
        { // 权限列表界面
          path: '/roles',
          component: Roles
        },
        { // 商品分类页面
          path: '/categories',
          component: Cate
        }
      ]
    },
  ]
})

// 挂载路由导航
// 通过导航守卫控制路由跳转权限
router.beforeEach((to, from, next) => {
  // to -> 将要访问的路径
  // from -> 从哪个路径跳转而来
  // next -> 是一个函数，表示放行
  //  next()  放行   next('/login')  强制跳转

  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
