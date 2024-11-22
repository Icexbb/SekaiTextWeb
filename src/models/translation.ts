export interface ITranslatePart {
    origin: string
    translated: string
    comparison?: string
}

export interface ITranslateItem {
    id: number
    type: string
    content: ITranslatePart
}

export interface IDialogItem extends ITranslateItem {
    id: number
    type: string
    speakerId?: number
    speaker: ITranslatePart
    content: ITranslatePart
    isShake: boolean
    isFlashBack: boolean
    isClose:boolean
}

export interface IEffectItem extends ITranslateItem {
    id: number
    type: string
    content: ITranslatePart
}

