<script setup lang="ts">

import {MenuOption, NButton, NFlex, NIcon, NImage, NText, useMessage} from "naive-ui";
import {h, onMounted, onUnmounted, reactive, ref} from "vue";
import UploadCard from "../General/Upload.vue";
import {specialCharOption, UploadOption} from "../../models/constants.ts";
import {baseName, changeExt, readFileAsText, renderIcon} from "../../utils";
import {
    buildTranslatedData,
    exportTranslated,
    exportTranslatedWithOrigin,
    ITextTranslation
} from "../../models/text/translation.ts";
import storageManager, {StorageKey} from "../../storage";
import {ITranslateItem} from "../../models/scripts/translation.ts";
import router, {homeRoute} from "../../router";
import {
    ContentCopyRound,
    DarkModeRound,
    DownloadRound,
    PlaylistRemoveRound,
    SaveRound,
    UploadRound
} from "@vicons/material";
import {definedEvent, emitter} from "../../event/emitter.ts";
import Line from "./Line.vue";
import Confirm from "../General/Confirm.vue";
import PageSider from "../General/PageSider.vue";

const modalShowUpload = ref<boolean>(false)
const modalConfirmLoad = ref<boolean>(false)
const modalShowSaveAs = ref<boolean>(false)

const currentScriptName = ref<string>("")
const currentScript = reactive<ITextTranslation[]>([]);
const tempLoadedScriptName = ref<string>("");
const tempLoadedScript = reactive<ITextTranslation[]>([]);

const message = useMessage()
const showSaveLog = ref(true)

const updateItem = (index: number, updatedItem: ITranslateItem) => {
    currentScript[index] = updatedItem;
    saveToBrowser()
}

const applyScript = () => {
    while (currentScript.length > 0) currentScript.pop()
    currentScript.push(...tempLoadedScript)
    currentScriptName.value = tempLoadedScriptName.value

    while (tempLoadedScript.length > 0) tempLoadedScript.pop()

    modalConfirmLoad.value = false
    saveToBrowser()
}

const saveToBrowser = (showLog = true, forceShowLog = true) => {
    storageManager.setArray(StorageKey.textData, currentScript)
    storageManager.setString(StorageKey.textFile, currentScriptName.value)
    if (showLog && showSaveLog.value && currentScriptName.value.length > 0 || forceShowLog) {
        {
            message.success('保存成功')
            showSaveLog.value = false
            setTimeout(() => showSaveLog.value = true, 1000 * 60)
        }
    }
}

const clearData = () => {
    while (currentScript.length > 0) currentScript.pop()
    currentScriptName.value = ""
    saveToBrowser(false)
    message.success('清除完成')
}

const onUpload = async (options: UploadOption) => {
    modalShowUpload.value = false;
    const file = options.file.file!;

    if (file.name.toLowerCase().endsWith('.txt')) {
        const fileContent = await readFileAsText(file)
        const translations = buildTranslatedData(fileContent)
        while (tempLoadedScript.length > 0) tempLoadedScript.pop()
        tempLoadedScript.push(...translations)
        tempLoadedScriptName.value = baseName(file.name)

        if (currentScriptName.value.length > 0 && currentScriptName.value != tempLoadedScriptName.value) {
            modalConfirmLoad.value = true
        } else {
            applyScript()
        }
    } else {
        message.error('文件格式不支持')
    }
    options.fileList = []
}

const processDragOver = (event: DragEvent) => {
    if (currentScriptName.value.length == 0) return
    if (event.dataTransfer?.types!.every(t => t == "Files")) {
        modalShowUpload.value = true;
    }
}
const downloadFile = (withOrigin: boolean) => {
    modalShowSaveAs.value = false;
    const content = withOrigin ? exportTranslatedWithOrigin(currentScript) : exportTranslated(currentScript)
    const blob = new Blob([content], {type: 'application/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = changeExt(currentScriptName.value, '.txt')
    a.click()
    URL.revokeObjectURL(url)
}
const loadFromBrowser = () => {
    const translateData = storageManager.getArray<ITextTranslation>(StorageKey.textData)// localStorage.getItem('translate') ?? "[]"
    const sourceFile = storageManager.getString(StorageKey.textFile) // localStorage.getItem('sourceFile') ?? ""
    if (translateData && sourceFile) {
        currentScript.push(...translateData)
        currentScriptName.value = sourceFile
        message.success('已加载缓存数据')
    }
    saveToBrowser()
}
const icon = new URL(`/public/icon.ico`, import.meta.url).href
const menuOptions: MenuOption [] = [
    {
        label: "首页",
        key: "Home",
        icon: () => h(NImage, {
            previewDisabled: true,
            src: icon,
            style: {height: "24px", width: "24px"},
            onClick: () => router.push(homeRoute.path)
        }),
    },
    {key: 'divider-1', type: 'divider'},
    {
        label: () => h("a", {onClick: () => modalShowUpload.value = true}, "上传文件"),
        key: "Upload",
        icon: renderIcon(UploadRound),
    },
    {
        label: () => h("a", {onClick: () => saveToBrowser(true, true)}, "保存数据",),
        key: "Save",
        icon: renderIcon(SaveRound),
    },
    {
        label: () => h("a", {onClick: () => modalShowSaveAs.value = true}, "下载数据"),
        key: "Download",
        icon: renderIcon(DownloadRound),
    },
    {
        label: () => h("a", {onClick: clearData}, "清除数据"),
        key: "Clear",
        icon: renderIcon(PlaylistRemoveRound),
    },
    {key: 'divider-2', type: 'divider'},
    // {
    //     label: () => h("a", {onClick: fetchEventDataNow}, "更新闪回数据"),
    //     key: "Refresh", disabled: true, show: false,
    //     icon: renderIcon(RefreshRound),
    // },
    {
        label: () => h("a", {onClick: () => emitter.emit(definedEvent.ChangeTheme)}, "切换主题"),
        key: "Theme",
        icon: renderIcon(DarkModeRound),
    },
]
const copyChar = (value: string) => {
    navigator.clipboard.writeText(value)
    message.success(`已复制：${value}`)
}

onMounted(async () => {
    const sourceFile = storageManager.getString(StorageKey.textFile)
    if (!!sourceFile) loadFromBrowser()

    document.onkeydown = function (event) {
        let key = event.key.toLowerCase();
        if (key === 's' && event.ctrlKey) {
            event.preventDefault(); //关闭浏览器快捷键
            saveToBrowser(true, true)
        }
    }
})
onUnmounted(() => {
    document.onkeydown = null;
})
</script>

<template>
    <div>
        <n-layout has-sider class="app full-height full-width" @dragover="processDragOver">
            <PageSider :menu-options="menuOptions"/>
            <n-layout embedded :native-scrollbar="false" style="height: 100vh;">
                <n-layout-header bordered style="padding: 10px 30px 10px 30px;height: 85px">
                    <n-grid :cols="12">
                        <n-gi span="8">
                            <n-statistic label="源文件">
                                <n-text>{{ currentScriptName.length == 0 ? "未选择" : currentScriptName }}</n-text>
                            </n-statistic>
                        </n-gi>
                        <n-gi span="2">
                            <n-statistic
                                label="行数"
                                :value="Array.from(currentScript).filter(item=>item.content.translated.length>0).length"/>
                        </n-gi>
                        <n-gi span="2">
                            <n-statistic label="操作">
                                <n-flex>
                                    <n-popselect :options="specialCharOption" @update:value="copyChar">
                                        <n-button>
                                            <n-flex>
                                                <n-icon>
                                                    <ContentCopyRound/>
                                                </n-icon>
                                            </n-flex>
                                        </n-button>
                                    </n-popselect>
                                </n-flex>
                            </n-statistic>
                        </n-gi>
                    </n-grid>
                </n-layout-header>
                <n-layout-content bordered :native-scrollbar="false" style="height: calc(100vh - 90px)">
                    <n-flex align="center" justify="center" v-if="currentScriptName.length==0"
                            style="height: calc(100vh - 90px)">
                        <UploadCard :on-upload="onUpload" style="width: 90% ;height: 80%;"/>
                    </n-flex>
                    <n-scrollbar v-else>
                        <n-flex style="padding:20px 5px 20px 5px" vertical>
                            <template v-for="(item, index) in currentScript" :key="`${currentScriptName}-${item.id}`">
                                <Line :data="item " @update-item="updateItem(index, $event)"/>
                            </template>
                        </n-flex>
                    </n-scrollbar>
                </n-layout-content>
                <n-layout-footer></n-layout-footer>
            </n-layout>
        </n-layout>
        <n-modal v-model:show="modalShowUpload">
            <UploadCard :on-upload="onUpload" style="width: 80% ;height: 40vh;"/>
        </n-modal>
        <n-modal v-model:show="modalConfirmLoad">
            <Confirm content="确定要覆盖加载源文件吗：" :on-confirm="applyScript"
                     :on-cancel="()=>modalConfirmLoad=false"/>
        </n-modal>
        <n-modal v-model:show="modalShowSaveAs">
            <n-card style="height: 60%;width: 80%">
                <n-flex vertical>
                    <n-text>是否同时导出原文：</n-text>
                    <n-flex justify="space-around">
                        <n-button @click="()=>downloadFile(true)">
                            <n-text>是</n-text>
                        </n-button>
                        <n-button @click="()=>downloadFile(false)">
                            <n-text>否</n-text>
                        </n-button>
                    </n-flex>
                </n-flex>
            </n-card>
        </n-modal>
    </div>
</template>

<style scoped>

</style>