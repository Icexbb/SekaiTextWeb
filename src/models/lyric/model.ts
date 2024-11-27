export interface ILyricItem {
    id: number
    offset: number
    text: string
}

export function buildLyricData(content: string) {
    const data: ILyricItem[] = []
    content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        .forEach((line) => {
            const item: ILyricItem = {
                id: data.length,
                offset: 0,
                text: line,
            }
            data.push(item)
        })
    return data
}

export function formatLyricTime(time: number) {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const milliseconds = Math.floor(time * 1000) % 1000
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`
}

export function exportLyric(data: ILyricItem[], joins: string = "\n") {
    let lines: string[] = data.map(item => `[${formatLyricTime(item.offset)}]${item.text}`)
    return lines.join(joins)
}