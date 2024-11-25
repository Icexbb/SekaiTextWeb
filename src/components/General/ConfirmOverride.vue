<script setup lang="ts">

const {onConfirm, onCancel} = defineProps<{
    onConfirm: () => void,
    onCancel: () => void
}>()
</script>

<template>
    <n-card style="height: 60%;width: 80%">
        <n-flex vertical>
            <n-text>确定要覆盖加载源文件吗：</n-text>
            <n-flex justify="space-around">
                <n-button type="error" @click="onConfirm">
                    <n-text>是</n-text>
                </n-button>
                <n-button @click="onCancel">
                    <n-text>否</n-text>
                </n-button>
            </n-flex>
        </n-flex>
    </n-card>
</template>
