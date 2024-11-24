import {createRouter, createWebHashHistory, Router, RouteRecordRaw, RouterOptions} from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        // @ts-ignore
        component: () => import("../components/TranslatePage.vue")
    },
]

// RouterOptions是路由选项类型
const options: RouterOptions = {
    history: createWebHashHistory(),
    routes,
}

// Router是路由对象类型
const router: Router = createRouter(options)

export default router

