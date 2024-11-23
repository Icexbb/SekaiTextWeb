<script setup lang="ts">
import {reactive, ref, toRefs, watch} from 'vue';
import {IDialogItem} from "../models/translation.ts";
import {NFlex, NText} from "naive-ui"

const {data, translateName = true} = defineProps<{
    data: IDialogItem
    translateName?: boolean
}>()

const localItem = reactive({...toRefs(data)}); // 创建 item 的本地响应式副本
const translateStatus = ref<string>("success");
const translateErrors = ref<string>("");
const editorGetFocused = ref<boolean>(false)
const emit = defineEmits(['update-item']);

watch(localItem, (newValue) => emit('update-item', {...newValue}), {deep: true});

const getIcon = () => {
    if (!localItem.speakerId) return "";
    const url = new URL(`/src/assets/icons/chr_${localItem.speakerId}.png`, import.meta.url).href;
    return localItem.speakerId > 0 && localItem.speakerId < 31 ? url : "";
}

const noReturn = (value: string) => !value || !value.includes('\n')
const noMore3Lines = (value: string) => !value || value.split('\n').length <= localItem.content.origin.split('\n').length
const textCount = (props: { value: string }) => {
    return `${props.value.length}(${Math.max(...props.value.split('\n').map((line) => line.length))})`
}

const textValidation = (value: string) => {
    localItem.content.translated = textFix(value)
    if (!editorGetFocused.value) {
        translateStatus.value = 'success'
    } else {
        const error = checkText(localItem.content.translated)
        if (error.length > 0) {
            translateStatus.value = 'error'
        } else {
            translateStatus.value = 'success'
        }
    }
}
const textFix = (value: string) => {
    return value.replace(/…/ig, '...')
        .replace(/\(/ig, '（')
        .replace(/\)/ig, '）')
        .replace(/\?/ig, '？')
        .replace(/!/ig, '！')
        .replace(/,/ig, '，')
        .replace(/~/ig, '～')
        .replace(/欸/ig, '诶')
}
const checkText = (value: string) => {
    const errors = []
    const normalEnd = ['、', '，', '。', '？', '！', '～', '♪', '☆', '.', '—']
    const unusualEnd = ['）', '」', '』', '”']
    if (normalEnd.includes(value[value.length - 1])) {
        if (value.includes("...，") || value.includes("...。")) {
            errors.push("省略号后不应该有逗号、句号")
        }
    } else if (unusualEnd.includes(value[value.length - 1])) {
        if (value.length > 1 && !normalEnd.includes(value[value.length - 2])) {
            errors.push("语句缺少结束标点")
        }
    } else {
        errors.push("语句缺少结束标点")
    }

    if (value.includes("—")) {
        if (value.split("—").length != value.split("——").length * 2 - 1) {
            errors.push("破折号使用双破折号")
        }
    }

    const maxLength = Math.max(...value.split("\n").map(v => v.trim().length))
    const lengthLimit = 35
    if (maxLength >= lengthLimit) {
        errors.push(`单行字数过长(${maxLength}>${lengthLimit})`)
    }
    translateErrors.value = errors.join("\n")
    return errors
}
</script>

<template>
    <n-card class="translate-card" hoverable>
        <template #header>
            <n-flex align="self-start">
                <n-image :src="getIcon()" v-if="getIcon().length>0" height="60" preview-disabled draggable="false"/>
                <n-flex vertical style="{height: 50px}">
                    <n-text style="font-weight: bold;font-size: larger">{{ data.speaker.origin }}</n-text>
                    <n-flex vertical>
                        <template v-for="line in data.content.origin.split('\n')">
                            <n-text style="line-height: normal">{{ line }}</n-text>
                        </template>
                    </n-flex>
                </n-flex>
            </n-flex>
        </template>
        <template #default>
            <n-input-group v-if="localItem.content.comparison || localItem.speaker.comparison">
                <n-input :value="localItem.speaker.comparison??''"
                         :placeholder="localItem.speaker.comparison??localItem.speaker.origin"
                         :style="{ width:translateName? '25%':'0%' }" type="textarea"
                         :rows="(localItem.content.comparison??'').split('\n').length"
                         :resizable="false"
                         readonly
                />
                <n-input :value="localItem.content.comparison??''"
                         :style="{ width: translateName? '75%':'100%' }" type="textarea"
                         :rows="(localItem.content.comparison??'').split('\n').length"
                         :placeholder="localItem.content.comparison??''"
                         :resizable="false" show-count :render-count="textCount"
                         readonly
                />
            </n-input-group>
            <n-popover trigger="manual" :show="editorGetFocused && translateErrors.length>0">
                <template #trigger>
                    <n-input-group>
                        <n-input v-model:value="localItem.speaker.translated"
                                 :style="{ width:translateName? '25%':'0%'  }" type="textarea"
                                 :rows="localItem.content.origin.split('\n').length"
                                 :placeholder="localItem.speaker.origin"
                                 :resizable="false"
                                 :allow-input="noReturn" clearable
                        />
                        <n-input v-model:value="localItem.content.translated"
                                 :style="{ width: translateName? '75%':'100%' }" type="textarea"
                                 :rows="localItem.content.origin.split('\n').length"
                                 :placeholder="localItem.content.origin"
                                 :resizable="false" show-count :render-count="textCount"
                                 :allow-input="noMore3Lines" clearable
                                 :status="translateStatus" @update:value="textValidation"

                                 @focusin="()=>editorGetFocused=true"
                                 @focusout="()=>editorGetFocused=false"
                        />
                    </n-input-group>
                </template>
                <template #default>
                    <n-flex vertical v-for="(line,index) in translateErrors.split('\n')" :key="index">
                        <n-text>{{ line }}</n-text>
                    </n-flex>
                </template>
            </n-popover>

        </template>
    </n-card>
    <n-card class="translate-card" hoverable v-if="localItem.isClose">
        <n-flex justify="center">
            <n-text>--------------------</n-text>
        </n-flex>
    </n-card>
</template>

<style scoped>

</style>