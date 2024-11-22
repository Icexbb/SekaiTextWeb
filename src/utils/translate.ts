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
    let content = ''
    data.forEach(item => {
        if (item.type == 'dialog') {
            content += `${(item as IDialogItem).speaker.translated}：${(item as IDialogItem).content.translated}\n`
        } else {
            content += `${(item as IEffectItem).content.translated}\n`
        }
    })
    return content
}