<template>
    <n-layout-footer bordered style="padding: 10px 30px 10px 30px;height: 80px">
        <n-grid :cols="12">
            <n-gi :span="2">
                <n-flex>
                    <n-statistic label="控制">
                        <n-flex>
                            <n-icon @click="togglePlay">
                                <PauseRound v-if="audioPlaying"/>
                                <PlayArrowRound v-else/>
                            </n-icon>
                            <n-popover style="max-height: 200px;">
                                <template #trigger>
                                    <n-icon @wheel="(e:WheelEvent)=>audioManager.gain-=Math.sign(e.deltaY)*0.01">
                                        <VolumeUpRound v-if="gainValue>=0.6"/>
                                        <VolumeDownRound v-else-if="gainValue!=0"></VolumeDownRound>
                                        <VolumeMuteRound v-else/>
                                    </n-icon>
                                </template>
                                <template #default>
                                    <n-flex style="height: 100px;" align="stretch" justify="center">
                                        <n-slider :value="gainValue" vertical
                                                  :format-tooltip="(v)=>(v*100).toFixed(0)"
                                                  :max="1" :min="0" :step="0.01"
                                                  @update:value="(v)=>{audioManager.gain = v}"
                                        />
                                    </n-flex>
                                </template>
                                <template #footer>
                                    <n-flex justify="center">
                                        <n-text>{{ threshold(0, gainValue * 100, 100).toFixed(0) }}</n-text>
                                    </n-flex>
                                </template>
                            </n-popover>
                            <n-popover style="max-height: 200px">
                                <template #trigger>
                                    <n-icon @click="()=>{audioManager.speed=1}">
                                        <SpeedRound/>
                                    </n-icon>
                                </template>
                                <template #default>
                                    <n-flex style="height: 100px;" align="stretch" justify="center">
                                        <n-slider :value="speedValue" vertical :tooltip="false"
                                                  :max="1" :min="0" :step="0.01"
                                                  @update:value="(v)=>{audioManager.speed = deLogSpeed(v)}"
                                        >
                                        </n-slider>
                                    </n-flex>
                                </template>
                                <template #footer>
                                    <n-flex justify="center">
                                        <n-text>{{ threshold(0.1, deLogSpeed(speedValue), 5).toFixed(1) }}</n-text>
                                    </n-flex>
                                </template>
                            </n-popover>
                        </n-flex>

                    </n-statistic>
                </n-flex>

            </n-gi>
            <n-gi :span="10">
                <n-statistic :label="`${showName?audioName+' ':''}${formatLyricTime(audioProgress)}`">
                    <n-flex>
                        <n-slider :value="audioProgress" :format-tooltip="formatLyricTime"
                                  :max="audioDuration" :step="0.01" style="width: 100%;"
                                  @update:value="(v)=>{audioManager.currentAt = v}"
                        />
                    </n-flex>
                </n-statistic>
            </n-gi>

        </n-grid>
    </n-layout-footer>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
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
import {threshold} from "../../utils";

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

onMounted(() => {
    audioManager.init()
})

onUnmounted(() => {
    audioManager.pause()
})

</script>