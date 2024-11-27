<script setup lang="ts">
import {NIcon, NText} from "naive-ui"
import {UploadOption} from "../../models/constants.ts";
import {UploadRound} from "@vicons/material"
import type {Component} from "vue";

const {onUpload, icon = UploadRound, disabled} = defineProps<{
    onUpload: (options: UploadOption) => void
    icon?: Component
    disabled?: boolean
}>()
</script>
<template>
    <n-card>
        <n-upload
            :default-upload="false" :show-file-list="false"
            :max="1"
            @change="onUpload"
            trigger-style="height: 100%"
            style="height: 100%"
            multiple
            :disabled="disabled"
        >
            <n-upload-dragger style="height: 100%;width: 100%">
                <n-flex vertical justify="center" style="height: 100%">
                    <div style="margin-bottom: 12px">
                        <n-icon size="48" depth="3">
                            <component :is="icon"/>
                        </n-icon>
                    </div>
                    <n-text style="font-size: 16px">
                        点击或者拖动文件到该区域来上传
                    </n-text>
                </n-flex>
            </n-upload-dragger>
        </n-upload>
    </n-card>
</template>
