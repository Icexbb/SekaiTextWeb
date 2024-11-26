<script setup lang="ts">

import {h, onMounted, onUnmounted, ref} from "vue";
import {extName, renderIcon} from "../../utils";
import {
    DarkModeRound,
    DownloadRound,
    PauseRound,
    PlayArrowRound,
    PlaylistRemoveRound,
    SaveRound,
    UploadRound
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

const message = useMessage()


const modalShowUpload = ref<boolean>(false)
const modalConfirmLoad = ref<boolean>(false)

const currentAudioName = ref<string>("")
const currentLyricName = ref<string>("")
const currentLyricData = ref<string[]>([])

const tempAudioName = ref<string>("")
const tempLyricName = ref<string>("")
const tempLyricData = ref<string[]>([])

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
    if (currentLyricName.value.length == 0) return
    if (event.dataTransfer?.types!.every(t => t == "Files")) {
        modalShowUpload.value = true;
    }
}

const playbackDuration = ref<number>(0)
const playbackProgress = ref<number>(0)
const playBarProgress = ref<number>(0)
const playbackSyncing = ref<boolean>(true)
const playbackPlaying = ref<boolean>(false)
setInterval(() => {
    playbackPlaying.value = audioManager.playing
    playbackProgress.value = audioManager.currentAt
    playbackDuration.value = audioManager.duration
    if (playbackSyncing.value) {
        playBarProgress.value = playbackProgress.value
    }
}, 50)

async function onUpload(option: UploadOption) {
    modalShowUpload.value = false;
    const file = option.file.file!;

    switch (extName(file.name)) {
        case ".txt":
            break;
        case ".mp3":
        case ".wav":
        case ".flac":
        case ".ogg":
            tempAudioName.value = file.name
            currentAudioName.value = file.name
            await audioManager.loadFile(file)
            audioManager.play()


            break;
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

function seekStart() {
    playbackSyncing.value = false
}

function seekEnd() {
    playbackSyncing.value = false
}

function seekProgress(value: number) {
    audioManager.currentAt = value
}

function formatTime(value: number): string {
    const min = Math.floor(value / 60)
    const sec = Math.floor(value % 60)
    return `${min}:${sec < 10 ? '0' + sec : sec}`
}

function togglePlay() {
    if (audioManager.playing) {
        audioManager.pause()
    } else {
        audioManager.resume()
    }
}

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
                    </n-grid>
                </n-layout-header>
                <n-layout-content bordered :native-scrollbar="false" style="height: calc(100vh - 90px - 80px)">
                    <n-flex align="center" justify="center" v-if="currentLyricName.length==0"
                            style="height: calc(100vh - 90px - 80px)">
                        <UploadCard :on-upload="onUpload" style="width: 90% ;height: 80%;"/>
                    </n-flex>

                </n-layout-content>
                <n-layout-footer bordered style="padding: 10px 30px 10px 30px;height: 80px">
                    <n-grid :cols="12">
                        <n-gi :span="2">
                            <n-statistic label="控制">
                                <n-flex>
                                    <n-button @click="togglePlay">
                                        <n-icon>
                                            <PauseRound v-if="playbackPlaying"/>
                                            <PlayArrowRound v-else/>
                                        </n-icon>
                                    </n-button>
                                </n-flex>
                            </n-statistic>
                        </n-gi>
                        <n-gi :span="8">
                            <n-statistic :label="formatTime(playbackProgress)">
                                <n-flex>
                                    <n-slider :value="playbackProgress" :format-tooltip="formatTime"
                                              :max="playbackDuration" :step="0.01"
                                              @update:value="seekProgress"
                                              @dragstart="seekStart"
                                              @dragend="seekEnd"
                                    />
                                </n-flex>
                            </n-statistic>
                        </n-gi>
                    </n-grid>
                </n-layout-footer>
            </n-layout>
        </n-layout>
        <n-modal v-model:show="modalShowUpload">
            <UploadCard :on-upload="onUpload" style="width: 80% ;height: 40vh;"/>
        </n-modal>
        <n-modal v-model:show="modalConfirmLoad">
            <Confirm :on-confirm="applyLyric" :on-cancel="()=>modalConfirmLoad=false"/>
        </n-modal>
    </div>
</template>