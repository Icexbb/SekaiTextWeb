<script setup lang="ts">

import {ITextTranslation} from "../../models/text/translation.ts";
import {reactive, toRefs, watch} from "vue";
import {NFlex, NText} from "naive-ui";

const emit = defineEmits(['update-item']);
const {data} = defineProps<{ data: ITextTranslation }>()
const localItem = reactive({...toRefs(data)}); // 创建 item 的本地响应式副本
watch(localItem, (newValue) => emit('update-item', {...newValue}), {deep: true});

</script>

<template>
    <n-card class="translate-card" hoverable v-if="localItem.content.origin.length==0">
        <n-flex justify="center">
            <n-text>--------------------</n-text>
        </n-flex>
    </n-card>
    <n-card class="translate-card" hoverable v-else>
        <template #header>
            <n-flex align="self-start">
                <n-text style="line-height: normal">{{ data.content.origin }}</n-text>
            </n-flex>
        </template>
        <n-input
            v-model:value="localItem.content.translated"
            :placeholder="localItem.content.origin"
            show-count
            clearable
        />
    </n-card>
</template>

<style scoped>

</style>