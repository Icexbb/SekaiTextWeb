<script setup lang="ts">
import {ref} from "vue"
import {MenuOption} from "naive-ui";

const menuCollapsed = ref<boolean>(true)
const {menuOptions = []} = defineProps<{
    menuOptions?: MenuOption []
}>()
</script>
<template>
    <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="40"
        :width="240"
        :collapsed="menuCollapsed"
        :show-trigger="false"

        @collapse="()=>{menuCollapsed = true}"
        @expand="()=>{menuCollapsed = false}"
    >
        <n-menu
            :collapsed="menuCollapsed"
            :collapsed-width="40"
            :collapsed-icon-size="20"
            :options="menuOptions"
        />
    </n-layout-sider>
</template>
