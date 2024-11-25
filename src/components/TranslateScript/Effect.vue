<script setup lang="ts">
import {reactive, toRefs, watch} from 'vue';
import {IEffectItem} from "../../models/scripts/translation.ts";
import {NFlex, NText} from "naive-ui"

const {data} = defineProps<{
    data: IEffectItem
}>()

const localItem = reactive({...toRefs(data)}); // 创建 item 的本地响应式副本
const emit = defineEmits(['update-item']);
watch(localItem, (newValue) => emit('update-item', {...newValue}), {deep: true});// 通知父组件更新数据

</script>

<template>
    <n-card class="translate-card" hoverable>
        <template #header>
            <n-flex align="center" justify="center">
                <n-text>{{ data.content.origin }}</n-text>
            </n-flex>
        </template>
        <template #default>
            <n-flex align="center" justify="center">
                <n-input v-model:value="localItem.content.translated"
                         :style="{ width: '75%',textAlign: 'center'}"
                         placeholder="地点翻译"
                />
            </n-flex>
        </template>
    </n-card>
</template>

<style scoped>

</style>