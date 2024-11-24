import {getLast} from "./index.ts";

interface IClue {
    id: number
    title: string
    chapters: any[]
    inferredVoiceIDs: { prefix: string, chOffset: number }
}

class FlashBackAnalyzer {
    flashBackPattern = /voice_(.+)_\d+[a-z]?_\d+(?:_?.*)?$/
    areaTalkPattern = /areatalk_(ev|wl)_(.+)_\d+$/
    mainStoryEpPattern = /(.*?)(\d+)$/
    cardRarityEpPattern = /(\d+)(.*?)$/

    clueDict: Map<string, IClue> = new Map<string, IClue>()
    mainStory = {}
    events = {}
    noClue: IClue = {
        id: -1,
        title: "未知剧情",
        chapters: [],
        inferredVoiceIDs: {prefix: "BAD_STR", chOffset: 0}
    }

    voice_ms_to_mainStory_id = {
        'band': 'light_sound',
        'idol': 'idol',
        'street': 'street',
        'wonder': 'theme_park',
        'night': 'school_refusal',
        'piapro': 'piapro'
    }


    getClue(voiceId: string): string[] {
        let hints: string[] = []
        if (voiceId.includes('partvoice')) return hints;

        const clueMatch = voiceId.match(this.flashBackPattern)
        if (!clueMatch) return hints
        const clue = clueMatch.groups ? clueMatch.groups[1] : null
        if (!clue) return hints
        const clueWord = clue.split("_")
        if (clueWord[0] == "sc") clueWord.shift()
        return clueWord
    }

    checkFlashBack(voiceId: string) {
        const clue = this.getClue(voiceId)
        if (!clue || clue.length == 0) return;
        let type = clue.shift()!

        if (type == "ev" && ['a', 'b'].includes(getLast(getLast(clue) ?? "") ?? "")) type = "card"
        switch (type) {
            case "ev":
                let episode = parseInt(getLast(clue) ?? '-1')
                // let eventIdx =  parseInt(clue[0] ?? '-1')
                if (isNaN(episode)) episode = -1
                // dbManager.event.filter()


                break
            case "ms":
            case "op":
            case "unit":
                break
            case "card":
                break
            default:
                break
        }

    }
}

const flashBackAnalyzer = new FlashBackAnalyzer()
export default flashBackAnalyzer;