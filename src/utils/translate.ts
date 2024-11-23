import {IDialogItem, IEffectItem, ITranslateItem} from "../models/translation.ts";

export function buildTranslatedData(content: string) {

    const data: ITranslateItem[] = []

    content.split('\n').map(line => line.trim()).forEach((line) => {
        if (line.length == 0) return;
        if (line.includes('：')) {
            const item: IDialogItem = {
                id: data.length,
                type: "dialog",
                isClose: false,
                isFlashBack: false,
                isShake: false,
                speaker: {translated: line.split('：')[0], origin: line.split('：')[0]},
                content: {translated: line.split('：')[1], origin: line.split('：')[1]},
            }
            data.push(item)
        } else {
            const item: IEffectItem = {
                id: data.length, type: "effect",
                content: {translated: line, origin: line},
            }
            data.push(item)
        }
    })
    return data
}

export function exportTranslateData(data: ITranslateItem[]) {
    let lines: string[] = []
    data.forEach(item => {
        const c = item.content.translated.replace("\n", "\\N")
        if (item.type == 'dialog') {
            const s = (item as IDialogItem).speaker.translated
            lines.push(`${s}：${c}`)
        } else {
            lines.push(c)
        }
    })
    return lines.join("\n")
}