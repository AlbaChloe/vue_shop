import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'

Vue.use(VueRouter)


const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    }
    ,
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      //嵌套路由
      children: [
        {
          // 重定向的welcome页面
          path: '/welcome',
          component: Welcome
        },
        {
          // 用户列表页面
          path: '/users',
          component: Users
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
