export interface ISnippet {
    Action: number
    ProgressBehavior: number
    ReferenceIndex: number
    Delay: number
}

export interface ITalkData {
    TalkCharacters: { Character2dId: number }[]
    WindowDisplayName: string,
    Body: string,
    TalkTention: number,
    LipSync: number,
    MotionChangeFrom: number,
    Motions: {
        Character2dId: number,
        MotionName: string,
        FacialName: string,
        TimingSyncValue: number
    } [],
    Voices: {
        Character2dId: number,
        VoiceId: string,
        Volume: number
    }[],
    Speed: number,
    FontSize: number,
    WhenFinishCloseWindow: number,
    RequirePlayEffect: number,
    EffectReferenceIdx: number,
    RequirePlaySound: number,
    SoundReferenceIdx: number
}

export interface ISpecialEffectData {
    EffectType: number,
    StringVal: string,
    StringValSub: string,
    Duration: number,
    IntVal: number,
}

export interface IScript {
    ScenarioId: string,
    Snippets: ISnippet[],
    TalkData: ITalkData[],
    SpecialEffectData: ISpecialEffectData[]
}

