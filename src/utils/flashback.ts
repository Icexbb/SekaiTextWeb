import Event from "../models/event.ts";
import jsonp from "jsonp"

const eventDataUrl = "https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/refs/heads/main/events.json"

export async function fetchEventData() {
    return new Promise<Event | null>(resolve => {
        jsonp(eventDataUrl, {}, (err, data) => {
            if (err) {
                resolve(null)
            } else {
                resolve(JSON.parse(data) as Event)
            }
        })
    })
}

export async function updateEventData(fetchNow = false) {
    // const data = await fetchEventData()
    if (Date.now() - parseInt(localStorage.getItem("eventDataUpdateTime") ?? "0") > 1000 * 60 * 60 * 24 || fetchNow) {
        const data = await (await fetch(eventDataUrl)).json() as Event[]
        if (data) {
            localStorage.setItem("eventDataUpdateTime", Date.now().toString())
            localStorage.setItem("eventData", JSON.stringify(data))
        }
        return data
    } else {
        return JSON.parse(localStorage.getItem("eventData") ?? "[]") as Event[]
    }
}

export function getEventData() {
    return JSON.parse(localStorage.getItem("eventData") ?? "[]") as Event[]
}

export function checkFlashBack() {
    const events = getEventData()
    if (!events) return false
}
