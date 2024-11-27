import {readFileAsArrayBuffer} from "./index.ts";


class AudioManager {
    audioName: string = ""
    private sourceStarted = false
    private initialized = false
    private audioBuffer: AudioBuffer | null = null
    private audioSource: AudioBufferSourceNode | null = null
    private startAt = 0
    private pausedAt = 0
    private currentTime = 0;
    private playbackRate = 0

    private _context: AudioContext | undefined

    get context(): AudioContext {
        if (!this.initialized) this.init()
        return this._context!
    }

    private _gainNode: GainNode | undefined

    get gainNode(): GainNode {
        if (!this.initialized) this.init()
        return this._gainNode!
    }

    get duration() {
        return (this.audioSource?.buffer?.duration ?? 0)
    }

    get currentAt() {
        if (this.sourceStarted) {
            this.pausedAt = new Date().getTime() / 1000
        }
        this.currentTime = this.pausedAt - this.startAt
        return this.currentTime
    }

    set currentAt(value) {
        const playing = this.playing;
        if (playing) {
            this.pause()
            setTimeout(() => {
                this.play(value)
            }, 10)
        } else {
            const now = new Date().getTime() / 1000
            this.startAt = now - value
            this.pausedAt = now
        }
    }

    get gain() {
        if (this.initialized) return this.gainNode.gain.value
        return 1
    }

    set gain(value: number) {
        this.gainNode.gain.value = value
    }

    get playing() {
        return this.sourceStarted
    }

    get progress() {
        if (this.duration == 0) return 0
        return this.currentAt / this.duration
    }

    set progress(value: number) {
        if (this.duration == 0) return;
        this.currentAt = value * this.duration
    }

    get speed() {
        if (this.audioSource) {
            return this.audioSource.playbackRate.value
        } else {
            return this.playbackRate
        }
    }

    set speed(value: number) {
        if (this.audioSource) {
            this.audioSource.playbackRate.value = Math.min(this.audioSource.playbackRate.maxValue, Math.max(this.audioSource.playbackRate.minValue, value))
        } else {
            this.playbackRate = value
        }
    }

    init() {
        if (!this.initialized) {
            this._context = new AudioContext()
            this._gainNode = new GainNode(this._context, {
                gain: this.gain
            })
            this._gainNode.connect(this._context.destination)
            this.initialized = true
        }
    }

    async loadFile(file: File) {
        if (this.audioBuffer) {
            this.audioBuffer = null;
        }
        const arrayBuffer = await readFileAsArrayBuffer(file)
        this.audioBuffer = await this.decodeAudioData(arrayBuffer);
        this.audioName = file.name
        this.getSource()
    }

    play(startAt: number = 0, duration?: number) {
        if (this.audioBuffer) {
            this.playSource(startAt, duration)
        }
    }

    resume(duration?: number) {
        this.play(this.currentAt, duration)
    }

    pause() {
        this.stopSource()
    }


    private getSource() {
        if (this.audioSource) {
            this.audioSource.disconnect()
            this.audioSource = null;
        }
        const audioSource = new AudioBufferSourceNode(this.context, {
            buffer: this.audioBuffer,
            playbackRate: this.playbackRate == 0 ? undefined : this.playbackRate
        });
        audioSource.connect(this.gainNode);
        this.playbackRate = audioSource.playbackRate.value
        this.audioSource = audioSource;
        this.sourceStarted = false;
        this.audioSource.onended = () => {
            this.sourceStarted = false;
            this.getSource()
        }
    }

    private playSource(startAt: number, duration?: number) {
        if (!this.audioBuffer) return;
        if (!this.audioSource || this.sourceStarted) {
            this.getSource()
        }
        this.audioSource!.start(0, startAt, duration)
        this.startAt = new Date().getTime() / 1000 - startAt
        this.sourceStarted = true
    }

    private stopSource() {
        if (!this.audioSource) return;
        if (this.playing) this.audioSource.stop()
        this.pausedAt = new Date().getTime() / 1000
        this.getSource()
    }

    private async decodeAudioData(arrayBuffer: ArrayBuffer) {
        return new Promise<AudioBuffer>(resolve => {
            this.context.decodeAudioData(arrayBuffer, resolve)
        })
    }
}

const audioManager = new AudioManager();

export default audioManager;