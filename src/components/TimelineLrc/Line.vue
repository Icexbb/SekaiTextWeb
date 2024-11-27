<script setup lang="ts">

import {NFlex, NText} from "naive-ui";
import {formatLyricTime, ILyricItem} from "../../models/lyric/model.ts";
import {watch} from "vue";

const {data, progress = -1} = defineProps<{ data: ILyricItem, progress?: number }>()
watch(() => progress, (newValue) => {
    if (newValue == data.id) {
        const el = document.querySelector(`.timeline-card-${data.id}`)
        if (el) {
            el.scrollIntoView({block: 'center', inline: 'center', behavior: 'smooth'})
        }
    }
})

const emit = defineEmits(["on-click"])
</script>

<template>
    <n-card :class="'translate-card timeline-card '+ `timeline-card-${data.id}`" hoverable
            :style="{background:progress==data.id?'gray':''}"
            @click="()=>emit('on-click',data.id)">
        <n-flex align="self-start">
            <n-text style="line-height: normal">{{ formatLyricTime(data.offset) }}</n-text>
            <n-text style="line-height: normal">{{ data.text }}</n-text>
        </n-flex>
    </n-card>
</template>

<style scoped>

</style>