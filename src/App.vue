<script setup lang="ts">
import {darkTheme, lightTheme} from 'naive-ui'
import {ref} from "vue";
import {definedEvent, emitter} from "./event/emitter.ts";

const useDarkTheme = ref(JSON.parse(localStorage.getItem("theme") ?? "false"))
emitter.on(definedEvent.ChangeTheme, () => {
    useDarkTheme.value = !useDarkTheme.value
    localStorage.setItem("theme", JSON.stringify(useDarkTheme.value))
})
</script>

<template>
    <n-config-provider :theme="useDarkTheme?darkTheme:lightTheme">
        <n-message-provider>
            <n-modal-provider>
                <router-view v-slot="{ Component }" class="app full-height full-width">
                    <component :is="Component"/>
                </router-view>
            </n-modal-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<style scoped>

</style>
