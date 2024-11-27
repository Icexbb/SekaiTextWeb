import {createRouter, createWebHashHistory, Router, RouteRecordRaw, RouterOptions} from 'vue-router'
import {
    FileDownloadRound,
    HomeRound,
    QueueMusicRound,
    SubscriptionsRound,
    SubtitlesRound,
    TextSnippetRound
} from "@vicons/material";

interface IRoutePath {
    key: string
    name: string
    path: string
    icon: any
    disabled?: boolean
    hidden?: boolean
}

export const routeName: IRoutePath[] = [
    {
        key: "Home",
        name: "首页",
        path: "/",
        icon: HomeRound,
        hidden: true
    },
    {
        key: "TranslateScript",
        name: "剧本翻译",
        path: "/translate/script",
        icon: SubscriptionsRound
    },
    {
        key: "TranslateText",
        name: "文本翻译",
        path: "/translate/text",
        icon: TextSnippetRound
    },
    {
        key: "DownloadScript",
        name: "剧本下载",
        path: "/download/script",
        icon: FileDownloadRound,
        disabled: true
    },
    {
        key: "TimelineLrc",
        name: "Lrc歌词制作",
        path: "/timeline/lrc",
        icon: QueueMusicRound,
    },
    {
        key: "TimelineSrt",
        name: "Srt字幕制作",
        path: "/timeline/srt",
        icon: SubtitlesRound,
        disabled: true
    },
]

export const homeRoute = routeName[0]

export function getRoute(name: string) {
    return routeName.find(item => item.key === name)
}

const routes: RouteRecordRaw[] = routeName.map((item) =>
    ({
        path: item.path,
        name: item.key,
        component: () => import((`../components/${item.key}/Page.vue`))
    })
);
routes.push({
    path: '/:catchAll(.*)',
    redirect: '/'
})

// RouterOptions是路由选项类型
const options: RouterOptions = {
    history: createWebHashHistory(),
    routes,
}

// Router是路由对象类型
const router: Router = createRouter(options)
export default router

