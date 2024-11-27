import mitt, {Handler} from "mitt";

export enum StorageKey {
    scriptData = 'scriptData',
    scriptFile = "scriptFile",
    scriptId = "scriptId",

    textData = "textData",
    textFile = "textFile",
    
    sekaiDataUpdateTime = "sekaiDataUpdateTime",
    
    sekaiDataEvent = "sekaiDataEvent",
    sekaiDataUnitStory = "sekaiDataUnitStory",

    lyricData="lyricData",
    lyricFile = "lyricFile"
        
}

const storageEmitter = mitt()

class StorageManager {

    private emitter = storageEmitter;

    setObject(key: StorageKey, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
        this.emitter.emit(key)
    }

    setNumber(key: StorageKey, value: number) {
        this.setObject(key, value)
    }

    setString(key: StorageKey, value: string) {
        this.setObject(key, value)
    }

    setBoolean(key: StorageKey, value: boolean) {
        this.setObject(key, value)
    }

    setArray<T>(key: StorageKey, value: T[]) {
        this.setObject(key, value)
    }

    getObject(key: StorageKey) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    getNumber(key: StorageKey) {
        let res = this.getObject(key)
        return res && typeof res === 'number' ? res : 0
    }

    getString(key: StorageKey) {
        let res = this.getObject(key)
        return res && typeof res === 'string' ? res : ''
    }

    getBoolean(key: StorageKey) {
        let res = this.getObject(key)
        return res !== null && typeof res === 'boolean' ? res : false
    }

    getArray<T>(key: StorageKey): T[] {
        let res = this.getObject(key)
        return (res && Array.isArray(res) ? res : []) as T[]
    }

    watch<T>(key: StorageKey, callback: Handler<T>): void {
        this.emitter.on(key, () => {
            callback(this.getObject(key) as T)
        })
    }
}

const storageManager = new StorageManager();

export default storageManager;