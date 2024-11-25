export interface ITranslatePart {
    origin: string
    translated: string
}

export interface ITextTranslation {
    id: number
    content: ITranslatePart
}

export function exportTranslated(data: ITextTranslation[], joins: string = "\n") {
    let lines: string[] = data.map(item => item.content.translated)
    return lines.join(joins)
}

export function exportTranslatedWithOrigin(data: ITextTranslation[], joins: string = "\n\n") {
    let lines: string[] = data.map(item => `${item.content.origin}\n${item.content.translated}`)
    return lines.join(joins)
}

export function buildTranslatedData(content: string) {
    const data: ITextTranslation[] = []
    content.split('\n').map(line => line.trim()).forEach((line) => {
        const item: ITextTranslation = {
            id: data.length,
            content: {translated: line, origin: line},
        }
        data.push(item)
    })
    return data
}