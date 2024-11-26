<script setup lang="ts">
import {MenuOption, NImage} from "naive-ui";
import {h} from "vue";
import {DarkModeRound} from "@vicons/material";
import {Github} from "@vicons/fa"
import {definedEvent, emitter} from "../../event/emitter.ts";
import {renderIcon} from "../../utils";

import router, {routeName} from "../../router";
import PageSider from "../General/PageSider.vue";

const icon = new URL(`/public/icon.ico`, import.meta.url).href
const menuOptions: MenuOption [] = [
    {
        label: "Sekai Text",
        key: "Home",
        icon: () => h(NImage, {previewDisabled: true, src: icon, style: {height: "24px", width: "24px"}}),
    },
    {key: 'divider-1', type: 'divider'},
    {
        label: () => h("a", {onClick: () => emitter.emit(definedEvent.ChangeTheme)}, "切换主题"),
        key: "Theme",
        icon: renderIcon(DarkModeRound),
    },
    {
        label: () => h("a", {href: "https://github.com/icexbb/SekaiTextWeb"}, "View Source"),
        key: "GitHub",
        icon: renderIcon(Github),
    }
]

</script>

<template>
    <n-layout has-sider class="app full-height full-width">
        <PageSider :menu-options="menuOptions"/>
        <n-layout-content bordered>
            <n-flex vertical align="center" justify="center" style="height: 100%" :size="50">
                <n-image :src="icon" height="200" preview-disabled/>
                <n-flex justify="space-evenly" size="large">
                    <template v-for="item in routeName" :key="item.key">
                        <n-button
                            @click="()=>router.push(item.path)"
                            :disabled="item.disabled"
                            v-if="!item.hidden"
                        >
                            <n-flex>
                                <n-icon>
                                    <component :is="item.icon"/>
                                </n-icon>
                                <n-text>{{ item.name }}</n-text>
                            </n-flex>
                        </n-button>
                    </template>
                </n-flex>
            </n-flex>
        </n-layout-content>
    </n-layout>
</template>

<style scoped>

</style>