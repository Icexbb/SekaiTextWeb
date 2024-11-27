<template>
    <n-layout-footer bordered style="padding: 10px 30px 10px 30px;height: 80px">
        <n-grid :cols="12">
            <n-gi :span="2">
                <n-statistic label="控制">
                    <n-flex>
                        <n-button @click="togglePlay">
                            <n-icon>
                                <PauseRound v-if="audioPlaying"/>
                                <PlayArrowRound v-else/>
                            </n-icon>
                        </n-button>
                    </n-flex>
                </n-statistic>
            </n-gi>
            <n-gi :span="8">
                <n-statistic :label="`${showName?audioName+' ':''}${formatLyricTime(audioProgress)}`">
                    <n-flex>
                        <n-slider :value="audioProgress" :format-tooltip="formatLyricTime"
                                  :max="audioDuration" :step="0.01" style="width: 95%;"
                                  @update:value="(v)=>{audioManager.currentAt = v}"
                        />
                    </n-flex>
                </n-statistic>
            </n-gi>
            <n-gi :span="1">
                <n-statistic label="音量控制">
                    <n-flex>
                        <n-popover style="height: 100px;width: 40px">
                            <template #trigger>
                                <n-icon @wheel="(e:WheelEvent)=>audioManager.gain-=Math.sign(e.deltaY)*0.01">
                                    <VolumeUpRound v-if="gainValue>=0.6"/>
                                    <VolumeDownRound v-else-if="gainValue!=0"></VolumeDownRound>
                                    <VolumeMuteRound v-else/>
                                </n-icon>
                            </template>
                            <template #default>
                                <n-flex style="height: 100px;width: 100%" align="stretch" justify="center">
                                    <n-slider :value="gainValue" vertical
                                              :format-tooltip="(v)=>(v*100).toFixed(0)"
                                              :max="1" :min="0" :step="0.01"
                                              @update:value="(v)=>{audioManager.gain = v}"
                                    />
                                </n-flex>
                            </template>
                        </n-popover>
                    </n-flex>
                </n-statistic>
            </n-gi>
            <n-gi :span="1">
                <n-statistic label="速度控制">
                    <n-flex>
                        <n-popover style="height: 100px;width: 40px">
                            <template #trigger>
                                <n-icon @click="()=>{audioManager.speed=1}">
                                    <SpeedRound/>
                                </n-icon>
                            </template>
                            <template #default>
                                <n-flex style="height: 100px;width: 100%" align="stretch" justify="center">
                                    <n-slider :value="speedValue" vertical
                                              :format-tooltip="(v)=>deLogSpeed(v).toFixed(1)"
                                              :max="1" :min="0" :step="0.01"
                                              @update:value="(v)=>{audioManager.speed = deLogSpeed(v)}"
                                    />
                                </n-flex>
                            </template>
                        </n-popover>
                    </n-flex>
                </n-statistic>
            </n-gi>
        </n-grid>
    </n-layout-footer>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {
    PauseRound,
    PlayArrowRound,
    SpeedRound,
    VolumeDownRound,
    VolumeMuteRound,
    VolumeUpRound
} from "@vicons/material";
import audioManager from "../../utils/audio.ts";
import {formatLyricTime} from "../../models/lyric/model.ts";

const {showName = false} = defineProps<{
    showName?: boolean
}>()

const audioName = ref<string>("")
const audioDuration = ref<number>(0)
const audioProgress = ref<number>(0)

const audioPlaying = ref<boolean>(false)

const gainValue = ref<number>(0)

const speedValue = ref<number>(0)

setInterval(() => {
    audioName.value = audioManager.audioName

    audioPlaying.value = audioManager.playing
    audioProgress.value = audioManager.currentAt
    audioDuration.value = audioManager.duration

    gainValue.value = audioManager.gain
    speedValue.value = logSpeed(audioManager.speed)
}, 50)

function logSpeed(x: number, max = 5, min = 0.1) {
    return (Math.log(x) - Math.log(min)) / (Math.log(max) - Math.log(min))
}

function deLogSpeed(y: number, max = 5, min = 0.1) {
    return Math.exp(
        (Math.log(max) - Math.log(min)) * y + Math.log(min)
    )
}

function togglePlay() {
    if (audioManager.playing) {
        audioManager.pause()
    } else if (audioManager.currentAt / audioManager.duration > 0.999) { // finished
        audioManager.play()
    } else {
        audioManager.resume()
    }
}

</script>