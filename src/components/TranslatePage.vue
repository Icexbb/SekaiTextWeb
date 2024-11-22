<script setup lang="ts">

import TranslateDialog from "./TranslateDialog.vue";
import {h, onMounted, reactive, ref} from "vue";
import {ITranslateItem} from "../models/translation.ts";
import TranslateEffect from "./TranslateEffect.vue";
import {baseName, changeExt, readFileAsText} from "../utils";
import {
    DarkModeRound,
    DownloadRound,
    HomeRound,
    PlaylistRemoveRound,
    RefreshRound,
    SaveRound,
    UploadRound
} from "@vicons/material"
import {MenuOption, NIcon, NText, useMessage} from "naive-ui"
import {buildTranslateData, isSameStructure, isValidScript, mergeComparison, mergeTranslate} from "../utils/scripts.ts";
import router from "../router";
import {buildTranslatedData, exportTranslateData} from "../utils/translate.ts";
import TranslateUpload from "./TranslateUpload.vue";
import {UploadOption} from "../models/constants.ts";
import {updateEventData} from "../utils/flashback.ts";
import {definedEvent, emitter} from "../event/emitter.ts";

const updateItem = (index: number, updatedItem: ITranslateItem) => currentScript[index] = updatedItem;
const renderIcon = (icon: any, props?: any) => () => h(NIcon, props, {default: () => h(icon)});

const message = useMessage()

const menuCollapsed = ref<boolean>(true)

const modalShowUpload = ref<boolean>(false)
const modalShowLoadAs = ref<boolean>(false)
const modalConfirmLoad = ref<boolean>(false)

const currentScriptName = ref<string>("")
const currentScript = reactive<ITranslateItem[]>([]);

const tempLoadedScriptName = ref<string>("");
const tempLoadedScript = reactive<ITranslateItem[]>([]);
const tempLoadedTranslation = reactive<ITranslateItem[]>([]);

const applyScript = () => {
    while (currentScript.length > 0) currentScript.pop()
    currentScript.push(...tempLoadedScript)
    currentScriptName.value = tempLoadedScriptName.value

    while (tempLoadedScript.length > 0) tempLoadedScript.pop()

    modalConfirmLoad.value = false
}
const onUpload = async (options: UploadOption) => {
    modalShowUpload.value = false;

    const loadJson = (fileContent: string) => {
        let jsonObject: any;
        try {
            jsonObject = JSON.parse(fileContent)
        } catch (e) {
            message.error(`文件读取错误\n${e}`)
            return;
        }

        if (isValidScript(jsonObject)) {
            tempLoadedScriptName.value = file.name
            while (tempLoadedScript.length > 0) tempLoadedScript.pop()
            tempLoadedScript.push(...buildTranslateData(jsonObject))
            if (currentScriptName.value.length > 0 && currentScriptName.value != tempLoadedScriptName.value) {
                modalConfirmLoad.value = true
            } else {
                applyScript()
            }

        } else {
            message.error('文件格式不支持')
        }
    }

    const loadTxt = (fileContent: string) => {
        if (currentScript.length == 0) {
            message.error('请先加载Json/Asset剧本文件')
            return
        }
        const translatedData = buildTranslatedData(fileContent)
        if (!isSameStructure(Array.from(currentScript.values()), translatedData)) {
            message.error('翻译文件结构不匹配')
            return
        }
        while (tempLoadedTranslation.length > 0) tempLoadedTranslation.pop()
        tempLoadedTranslation.push(...translatedData)
        modalShowLoadAs.value = true
    }

    const file = options.file.file!;

    if (file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.asset')) {
        const fileContent = await readFileAsText(file)
        loadJson(fileContent)
    } else if (file.name.toLowerCase().endsWith('.txt')) {
        const fileContent = await readFileAsText(file)
        loadTxt(fileContent)
    } else {
        message.error('文件格式不支持')
    }
    options.fileList = []
}

const loadAsTranslation = () => {
    modalShowLoadAs.value = false
    mergeTranslate(currentScript, tempLoadedTranslation)
    while (tempLoadedTranslation.length > 0) tempLoadedTranslation.pop()
}
const loadAsComparison = () => {
    modalShowLoadAs.value = false
    mergeComparison(currentScript, tempLoadedTranslation)
    while (tempLoadedTranslation.length > 0) tempLoadedTranslation.pop()
}
const processDragOver = (event: DragEvent) => {
    if (currentScriptName.value.length == 0) return
    if (event.dataTransfer?.types!.every(t => t == "Files")) {
        modalShowUpload.value = true;
    }
}

const saveToBrowser = (showLog = true) => {
    localStorage.setItem('translate', JSON.stringify(currentScript))
    localStorage.setItem('sourceFile', currentScriptName.value)
    if (showLog) message.success('保存成功')
}

const clearData = () => {
    while (currentScript.length > 0) currentScript.pop()
    while (tempLoadedTranslation.length > 0) tempLoadedTranslation.pop()
    currentScriptName.value = ""
    saveToBrowser(false)
    message.success('清除完成')
}


const downloadFile = () => {
    const blob = new Blob([exportTranslateData(currentScript)], {type: 'application/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = changeExt(baseName(currentScriptName.value), '.txt')
    a.click()
    URL.revokeObjectURL(url)
}
const loadFromBrowser = () => {
    const translateData = localStorage.getItem('translate')
    const sourceFile = localStorage.getItem('sourceFile')
    if (translateData && sourceFile) {
        currentScript.push(...JSON.parse(translateData))
        currentScriptName.value = sourceFile
        message.success('已加载缓存数据')
    }
}
const fetchEventDataNow = async () => {
    const data = await updateEventData(true)
    if (data) message.success("闪回数据已更新")
    else message.error("闪回数据更新失败")
}

onMounted(async () => {
    const sourceFile = localStorage.getItem('sourceFile')
    if (!!sourceFile) loadFromBrowser()
})

const menuOptions: MenuOption [] = [
    {
        label: "首页", key: "Home",
        icon: renderIcon(HomeRound, {onClick: () => router.push("Home")})
    },
    {key: 'divider-1', type: 'divider'},
    {
        label: "上传文件", key: "Upload",
        icon: renderIcon(UploadRound, {onClick: () => modalShowUpload.value = true}),
    },
    {
        label: "保存数据", key: "Save",
        icon: renderIcon(SaveRound, {onClick: () => saveToBrowser()}),
    },
    {
        label: "下载文件", key: "Download",
        icon: renderIcon(DownloadRound, {onClick: () => downloadFile()}),
    },
    {
        label: "清除数据", key: "Clear",
        icon: renderIcon(PlaylistRemoveRound, {onClick: () => clearData()}),
    },
    {key: 'divider-2', type: 'divider'},
    {
        label: "刷新闪回数据", key: "Refresh", disabled: true, show: false,
        icon: renderIcon(RefreshRound, {onClick: () => fetchEventDataNow()}),
    },
    {
        label: "切换主题", key: "Theme",
        icon: renderIcon(DarkModeRound, {onClick: () => emitter.emit(definedEvent.ChangeTheme)}),
    },
]

</script>

<template>
    <div>
        <n-layout has-sider class="app full-height full-width" @dragover="processDragOver">
            <n-layout-sider
                bordered
                collapse-mode="width"
                :collapsed-width="40"
                :width="240"
                :collapsed="menuCollapsed"
                :show-trigger="false"
                @collapse="menuCollapsed = true"
                @expand="menuCollapsed = false"
            >
                <n-menu
                    :collapsed="menuCollapsed"
                    :collapsed-width="40"
                    :collapsed-icon-size="20"
                    :options="menuOptions"
                />
            </n-layout-sider>

            <n-layout-content>
                <n-flex align="center" justify="center"
                        style="height: 100%;width: 100%;"
                        v-if="currentScriptName.length==0">
                    <TranslateUpload :on-upload="onUpload" style="width: 90% ;height: 80%;"/>
                </n-flex>


                <n-flex vertical v-for="(item, index) in currentScript"
                        :key="`${baseName(currentScriptName)}-${item.id}`">
                    <TranslateDialog
                        :data="item" v-if="item.type=='dialog'"
                        @update-item="updateItem(index, $event)"
                    />
                    <TranslateEffect
                        :data="item" v-if="item.type=='effect'"
                        @update-item="updateItem(index, $event)"
                    />
                </n-flex>
            </n-layout-content>
        </n-layout>
        <n-modal v-model:show="modalShowUpload">
            <TranslateUpload :on-upload="onUpload" style="width: 80% ;height: 40vh;"/>
        </n-modal>
        <n-modal v-model:show="modalShowLoadAs">
            <n-card style="height: 60%;width: 80%">
                <n-flex vertical>
                    <n-text>将翻译文件加载为：</n-text>
                    <n-flex justify="space-around">
                        <n-button @click="loadAsTranslation">
                            <n-text>翻译文本</n-text>
                        </n-button>
                        <n-button @click="loadAsComparison">
                            <n-text>对照文本</n-text>
                        </n-button>
                    </n-flex>
                </n-flex>
            </n-card>
        </n-modal>
        <n-modal v-model:show="modalConfirmLoad">
            <n-card style="height: 60%;width: 80%">
                <n-flex vertical>
                    <n-text>确定要覆盖加载剧本文件吗：</n-text>
                    <n-flex justify="space-around">
                        <n-button type="error" @click="applyScript">
                            <n-text>是</n-text>
                        </n-button>
                        <n-button @click="()=>modalConfirmLoad=false">
                            <n-text>否</n-text>
                        </n-button>
                    </n-flex>
                </n-flex>
            </n-card>
        </n-modal>
    </div>
</template>