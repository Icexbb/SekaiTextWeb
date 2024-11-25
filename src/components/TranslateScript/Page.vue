<script setup lang="ts">

import TranslateDialog from "./Dialog.vue";
import {h, onMounted, onUnmounted, reactive, ref} from "vue";
import {
    buildTranslatedData,
    exportTranslateData,
    IDialogItem,
    IEffectItem,
    ITranslateItem
} from "../../models/scripts/translation.ts";
import TranslateEffect from "./Effect.vue";
import {baseName, changeExt, readFileAsText, renderIcon} from "../../utils";
import {
    ContentCopyRound,
    DarkModeRound,
    DownloadRound,
    PlaylistRemoveRound,
    SaveRound,
    UploadRound
} from "@vicons/material"
import {MenuOption, NButton, NFlex, NIcon, NImage, NText, useMessage} from "naive-ui"
import {
    buildTranslateData,
    isSameStructure,
    isValidScript,
    mergeComparison,
    mergeTranslate
} from "../../models/scripts/scripts.ts";
import UploadCard from "../General/Upload.vue";
import {specialCharOption, UploadOption} from "../../models/constants.ts";
import {definedEvent, emitter} from "../../event/emitter.ts";
import {IScript} from "../../models/scripts/model.ts";
import storageManager, {StorageKey} from "../../storage";
import router, {getRoute, homeRoute} from "../../router";
import ConfirmOverride from "../General/ConfirmOverride.vue";

const updateItem = (index: number, updatedItem: ITranslateItem) => {
    const updateName = (origin: string, translated: string) => {
        for (let i = 0; i < currentScript.length; i++) {
            if (currentScript[i].type == "dialog") {
                const dialog = currentScript[i] as IDialogItem;
                if (dialog.speaker.origin == origin) {
                    dialog.speaker.translated = translated;
                    currentScript[i] = dialog;
                }
            }
        }
    }

    switch (updatedItem.type) {
        case "dialog":
            currentScript[index] = updatedItem;
            updateName((updatedItem as IDialogItem).speaker.origin, (updatedItem as IDialogItem).speaker.translated)
            break;
        case "effect":
            currentScript[index] = updatedItem;
            break;
    }
    saveToBrowser()
}

const message = useMessage()

const menuCollapsed = ref<boolean>(true)

const modalShowUpload = ref<boolean>(false)
const modalShowLoadAs = ref<boolean>(false)
const modalConfirmLoad = ref<boolean>(false)

const currentScriptId = ref<string>("")
const currentScriptName = ref<string>("")
const currentScript = reactive<ITranslateItem[]>([]);

const tempLoadedScriptId = ref<string>("");
const tempLoadedScriptName = ref<string>("");
const tempLoadedScript = reactive<ITranslateItem[]>([]);

const tempLoadedTranslation = reactive<ITranslateItem[]>([]);

const applyScript = () => {
    while (currentScript.length > 0) currentScript.pop()
    currentScript.push(...tempLoadedScript)
    currentScriptName.value = tempLoadedScriptName.value
    currentScriptId.value = tempLoadedScriptId.value

    while (tempLoadedScript.length > 0) tempLoadedScript.pop()

    modalConfirmLoad.value = false
    saveToBrowser()
}
const onUpload = async (options: UploadOption) => {
    modalShowUpload.value = false;

    const loadJson = (fileContent: string) => {
        let jsonObject: IScript;
        try {
            jsonObject = JSON.parse(fileContent)
        } catch (e) {
            message.error(`文件读取错误\n${e}`)
            return;
        }

        if (isValidScript(jsonObject)) {
            tempLoadedScriptName.value = baseName(file.name)
            tempLoadedScriptId.value = jsonObject.ScenarioId.length > 0 ? jsonObject.ScenarioId : baseName(file.name)

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
    saveToBrowser()
}
const loadAsComparison = () => {
    modalShowLoadAs.value = false
    mergeComparison(currentScript, tempLoadedTranslation)
    while (tempLoadedTranslation.length > 0) tempLoadedTranslation.pop()
    saveToBrowser()
}
const processDragOver = (event: DragEvent) => {
    if (currentScriptName.value.length == 0) return
    if (event.dataTransfer?.types!.every(t => t == "Files")) {
        modalShowUpload.value = true;
    }
}
const showSaveLog = ref(true)

const saveToBrowser = (showLog = true, forceShowLog = false) => {
    storageManager.setArray(StorageKey.scriptData, currentScript)
    storageManager.setString(StorageKey.scriptFile, currentScriptName.value)
    storageManager.setString(StorageKey.scriptId, currentScriptId.value)
    if (showLog && showSaveLog.value && currentScriptId.value.length > 0 || forceShowLog) {
        message.success('保存成功')
        showSaveLog.value = false
        setTimeout(() => showSaveLog.value = true, 1000 * 60)
    }
}

const clearData = () => {
    while (currentScript.length > 0) currentScript.pop()
    while (tempLoadedTranslation.length > 0) tempLoadedTranslation.pop()
    currentScriptName.value = ""
    currentScriptId.value = ""
    saveToBrowser(false)
    message.success('清除完成')
}

const downloadFile = () => {
    const blob = new Blob([exportTranslateData(currentScript)], {type: 'application/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = changeExt(currentScriptName.value, '.txt')
    a.click()
    URL.revokeObjectURL(url)
}
const loadFromBrowser = () => {
    const translateData = storageManager.getArray<ITranslateItem>(StorageKey.scriptData)// localStorage.getItem('translate') ?? "[]"
    const sourceFile = storageManager.getString(StorageKey.scriptFile) // localStorage.getItem('sourceFile') ?? ""
    const sourceId = storageManager.getString(StorageKey.scriptId)//localStorage.getItem('sourceId') ?? ""
    if (translateData && sourceFile) {
        currentScript.push(...translateData)
        currentScriptName.value = sourceFile
        currentScriptId.value = sourceId
        message.success('已加载缓存数据')
    }
    saveToBrowser()
}

// const fetchEventDataNow = async () => {
//     const data = await updateEventData(true)
//     if (data) message.success("闪回数据已更新")
//     else message.error("闪回数据更新失败")
// }


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
        label: () => h("a", {onClick: downloadFile}, "下载数据"),
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
    const sourceFile = localStorage.getItem('sourceFile')
    if (!!sourceFile) loadFromBrowser()

    document.onkeydown = function (event) {
        let key = event.key.toLowerCase();
        if (key === 's' && event.ctrlKey) {
            event.preventDefault(); //关闭浏览器快捷键
            saveToBrowser(true, true)
        }
    }
});
onUnmounted(() => {
    document.onkeydown = null;
});

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

                @collapse="()=>{menuCollapsed = true}"
                @expand="()=>{menuCollapsed = false}"
            >
                <n-menu
                    :collapsed="menuCollapsed"
                    :collapsed-width="40"
                    :collapsed-icon-size="20"
                    :options="menuOptions"
                />
            </n-layout-sider>
            <n-layout embedded :native-scrollbar="false" style="height: 100vh;">
                <n-layout-header bordered style="padding: 10px 30px 10px 30px;height: 85px">
                    <n-grid :cols="12">
                        <n-gi span="8">
                            <n-statistic label="剧本文件">
                                <n-text>{{ currentScriptId.length == 0 ? "未选择" : currentScriptId }}</n-text>
                            </n-statistic>
                        </n-gi>
                        <n-gi span="2">
                            <n-statistic label="剧本长度" :value="currentScript.length"/>
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
                    <n-scrollbar>
                        <n-flex style="padding:20px 5px 20px 5px" vertical>
                            <template v-for="(item, index) in currentScript"
                                      :key="`${currentScriptName}-${item.id}`">
                                <TranslateDialog
                                    :data="item as IDialogItem" v-if="item.type=='dialog'"
                                    @update-item="updateItem(index, $event)"
                                />
                                <TranslateEffect
                                    :data="item as IEffectItem" v-if="item.type=='effect'"
                                    @update-item="updateItem(index, $event)"
                                />
                            </template>
                        </n-flex>
                    </n-scrollbar>
                </n-layout-content>
            </n-layout>
        </n-layout>
        <n-modal v-model:show="modalShowUpload">
            <UploadCard :on-upload="onUpload" style="width: 80% ;height: 40vh;"/>
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
            <ConfirmOverride :on-confirm="applyScript" :on-cancel="()=>modalConfirmLoad=false"/>
        </n-modal>
    </div>
</template>