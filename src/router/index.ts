import {createRouter, createWebHashHistory, Router, RouteRecordRaw, RouterOptions} from 'vue-router'

export const routeName = {
    Home: {name: "Home", path: "/"},
    TranslateScript: {name: "TranslateScript", path: "/translate/script"},
    TranslateText: {name: "TranslateText", path: "/translate/text"}
}
const routes: RouteRecordRaw[] = [
    {
        path: routeName.Home.path,
        name: routeName.Home.name,
        component: () => import("../components/Home/Page.vue")
    },

    {
        path: routeName.TranslateScript.path,
        name: routeName.TranslateScript.name,
        component: () => import("../components/TranslateScript/Page.vue")
    },
    {
        path: routeName.TranslateText.path,
        name: routeName.TranslateText.name,
        component: () => import("../components/TranslateText/Page.vue")
    }
]

// RouterOptions是路由选项类型
const options: RouterOptions = {
    history: createWebHashHistory(),
    routes,
}

// Router是路由对象类型
const router: Router = createRouter(options)

export default router

