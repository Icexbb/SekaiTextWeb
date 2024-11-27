<script setup lang="ts">

import {NFlex, NText} from "naive-ui";
import {formatLyricTime, ILyricItem} from "../../models/lyric/model.ts";

const {data} = defineProps<{ data: ILyricItem }>()

</script>

<template>
    <n-card class="translate-card" hoverable>
        <n-flex align="self-start">
            <n-text style="line-height: normal">{{ formatLyricTime(data.offset) }}</n-text>
            <n-text style="line-height: normal">{{ data.text }}</n-text>
        </n-flex>
    </n-card>
</template>

<style scoped>

</style>