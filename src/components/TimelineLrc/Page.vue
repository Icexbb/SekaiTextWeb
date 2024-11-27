<script setup lang="ts">

import {h, onMounted, onUnmounted, ref} from "vue";
import {extName, readFileAsText, renderIcon} from "../../utils";
import {
    AudioFileRound,
    DarkModeRound,
    DownloadRound,
    PlaylistRemoveRound,
    SaveRound,
    TextSnippetRound,
    UploadRound,
    FactCheckRound
} from "@vicons/material"
import {MenuOption, NFlex, NImage, useMessage} from "naive-ui"
import UploadCard from "../General/Upload.vue";
import {definedEvent, emitter} from "../../event/emitter.ts";
import storageManager, {StorageKey} from "../../storage";
import router, {homeRoute} from "../../router";
import Confirm from "../General/Confirm.vue";
import {UploadOption} from "../../models/constants.ts";
import audioManager from "../../utils/audio.ts";
import PageSider from "../General/PageSider.vue";
import Line from "./Line.vue";
import {buildLyricData, ILyricItem} from "../../models/lyric/model.ts";
import AudioControlFooter from "./AudioControlFooter.vue";

const message = useMessage()


const modalShowUpload = ref<boolean>(false)
const modalConfirmLoad = ref<boolean>(false)

const currentAudioName = ref<string>("")
const currentLyricName = ref<string>("")
const currentLyricData = ref<ILyricItem[]>([])

const tempAudioName = ref<string>("")
const tempLyricName = ref<string>("")
const tempLyricData = ref<ILyricItem[]>([])

const icon = new URL(`/public/icon.ico`, import.meta.url).href

function saveToBrowser(_0: boolean, _1: boolean) {

}

function downloadFile() {

}

function clearData() {

}

function applyLyric() {
    currentLyricName.value = tempLyricName.value;
    currentLyricData.value = tempLyricData.value;
    tempLyricName.value = ""
    tempLyricData.value = []
    modalConfirmLoad.value = false
}

function loadFromBrowser() {
    message.success("")
}

function processDragOver(event: DragEvent) {
    if (currentLyricName.value.length == 0 || currentAudioName.value.length == 0) return
    if (event.dataTransfer?.types!.every(t => t == "Files")) {
        modalShowUpload.value = true;
    }
}


async function onUploadText(option: UploadOption) {
    modalShowUpload.value = false;
    const file = option.file.file!;

    switch (extName(file.name)) {
        case ".txt":
            const content = await readFileAsText(file)
            const data = buildLyricData(content)
            tempLyricName.value = file.name
            tempLyricData.value = data
            if (currentLyricName.value.length > 0 && currentLyricName.value != tempLyricName.value) {
                modalConfirmLoad.value = true
            } else {
                applyLyric()
            }
            break;
        default:
            message.error("不支持的文件类型")
    }

    option.fileList = []
}

async function onUploadAudio(option: UploadOption) {
    modalShowUpload.value = false;
    const file = option.file.file!;

    switch (extName(file.name)) {
        case ".mp3":
        case ".wav":
        case ".flac":
        case ".ogg":
            tempAudioName.value = file.name
            currentAudioName.value = file.name
            await audioManager.loadFile(file)
            break;
        default:
            message.error("不支持的文件类型")
    }

    option.fileList = []
}

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
    {
        label: () => h("a", {onClick: () => emitter.emit(definedEvent.ChangeTheme)}, "切换主题"),
        key: "Theme",
        icon: renderIcon(DarkModeRound),
    },
]


onMounted(() => {
    const sourceFile = storageManager.getString(StorageKey.scriptFile)
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
            <PageSider :menu-options="menuOptions"/>
            <n-layout embedded :native-scrollbar="false" style="height: 100vh;">
                <n-layout-header bordered style="padding: 10px 30px 10px 30px;height: 85px">
                    <n-grid :cols="12">
                        <n-gi span="6">
                            <n-statistic label="歌曲" > {{currentAudioName.length>0?currentAudioName:'未选择'}}</n-statistic>
                        </n-gi>
                        <n-gi span="6">
                            <n-statistic label="歌词" > {{currentLyricName.length>0?currentLyricName:'未选择'}}</n-statistic>
                        </n-gi>
                    </n-grid>
                </n-layout-header>
                <n-layout-content bordered :native-scrollbar="false" style="height: calc(100vh - 90px - 80px)">
                    <n-flex align="center" justify="center"
                            v-if="currentLyricName.length==0||currentAudioName.length==0"
                            style="height: calc(100vh - 90px - 80px)">
                        <UploadCard
                            :disabled="currentLyricName.length>0"
                            style="width: 45% ;height: 80%;"
                            :on-upload="onUploadText"
                            :icon="currentLyricName.length>0?FactCheckRound:TextSnippetRound"/>
                        <UploadCard
                            :disabled="currentAudioName.length>0"
                            style="width: 45% ;height: 80%;"
                            :on-upload="onUploadAudio"
                            :icon="currentAudioName.length>0?FactCheckRound:AudioFileRound"/>
                    </n-flex>
                    <n-scrollbar v-else>
                        <n-flex style="padding:20px 5px 20px 5px" vertical>
                            <template v-for="(item) in currentLyricData" :key="`${currentLyricName}-${item.id}`">
                                <Line :data="item"/>
                            </template>
                        </n-flex>
                    </n-scrollbar>
                </n-layout-content>
                <AudioControlFooter/>
            </n-layout>
        </n-layout>
        <n-modal v-model:show="modalShowUpload" style="height: 70vh;width: 90vw;">
            <n-card>
                <n-flex align="center" justify="center" style="height: 100%;width: 100%;">
                    <UploadCard
                        :disabled="currentLyricName.length>0"
                        style="width: 45% ;height: 80%;"
                        :on-upload="onUploadText"
                        :icon="currentLyricName.length>0?FactCheckRound:TextSnippetRound"/>
                    <UploadCard
                        :disabled="currentAudioName.length>0"
                        style="width: 45% ;height: 80%;"
                        :on-upload="onUploadAudio"
                        :icon="currentAudioName.length>0?FactCheckRound:AudioFileRound"/>
                </n-flex>
            </n-card>
        </n-modal>
        <n-modal v-model:show="modalConfirmLoad">
            <Confirm :on-confirm="applyLyric" :on-cancel="()=>modalConfirmLoad=false"/>
        </n-modal>
    </div>
</template>