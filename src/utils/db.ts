import storageManager, {StorageKey} from "../storage";
import IEvent from "../models/event.ts";
import IUnitStory from "../models/unitStory.ts";

class DbManager {
    dataRoot = "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/refs/heads/main/"
    eventDataUrl = this.dataRoot + "events.json"
    unitStoryUrl = this.dataRoot + "unitStories.json"
    updateInterval = 1000 * 60 * 60 * 24

    get updateTime() {
        return storageManager.getNumber(StorageKey.sekaiDataUpdateTime)
    }

    set updateTime(value) {
        storageManager.setNumber(StorageKey.sekaiDataUpdateTime, value)
    }

    get event() {
        return storageManager.getArray<IEvent>(StorageKey.sekaiDataEvent)
    }

    get unitStory() {
        return storageManager.getArray<IUnitStory>(StorageKey.sekaiDataUnitStory)
    }

    async updateEventData(fetchNow = false) {
        // const data = await fetchEventData()
        if ((Date.now() - this.updateTime) > this.updateInterval || fetchNow) return
        this.updateTime = Date.now()
        
        const events = await this.fetch(this.eventDataUrl) as IEvent[]
        if (events) storageManager.setArray(StorageKey.sekaiDataEvent, events)

        const unitStories = await this.fetch(this.unitStoryUrl) as IUnitStory[]
        if (unitStories) storageManager.setArray(StorageKey.sekaiDataUnitStory, unitStories)
    }

    private async fetch(url: string) {
        const resp = await fetch(url)
        return await resp.json() as object
    }
}

const dbManager = new DbManager();
export default dbManager;