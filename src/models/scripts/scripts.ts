import {C2dIdToCid} from "../constants.ts";
import {IScript, ISnippet, ITalkData} from "./model.ts";
import {IDialogItem, ITranslateItem} from "./translation.ts";

export function getCharacterId(talkData: ITalkData) {
    if (talkData.Voices.length != 1 && talkData.TalkCharacters.length != 1) return 0;

    if (talkData.TalkCharacters.length == 1) {
        const charaIdFromCharaL2dId = C2dIdToCid.get(talkData.TalkCharacters[0].Character2dId) ?? 0;
        if (charaIdFromCharaL2dId >= 1 && charaIdFromCharaL2dId <= 26) return charaIdFromCharaL2dId;
    } else {
        const charaIdFromVoiceL2dId = C2dIdToCid.get(talkData.Voices[0].Character2dId) ?? 0;
        if (charaIdFromVoiceL2dId >= 1 && charaIdFromVoiceL2dId <= 26) return charaIdFromVoiceL2dId;
    }
}

function isObjSnippet(obj: any): boolean {
    return (
        obj.Action !== undefined &&
        obj.ProgressBehavior !== undefined &&
        obj.ReferenceIndex !== undefined &&
        obj.Delay !== undefined
    );
}

function isObjTalkData(obj: any): boolean {
    return (
        obj.TalkCharacters !== undefined &&
        obj.WindowDisplayName !== undefined &&
        obj.Body !== undefined &&
        obj.TalkTention !== undefined &&
        obj.LipSync !== undefined &&
        obj.MotionChangeFrom !== undefined &&
        obj.Motions !== undefined &&
        obj.Voices !== undefined &&
        obj.Speed !== undefined &&
        obj.FontSize !== undefined &&
        obj.WhenFinishCloseWindow !== undefined &&
        obj.RequirePlayEffect !== undefined &&
        obj.EffectReferenceIdx !== undefined &&
        obj.RequirePlaySound !== undefined &&
        obj.SoundReferenceIdx !== undefined
    )
}

function isObjSpecialEffectData(obj: any): boolean {
    return (
        obj.EffectType !== undefined &&
        obj.StringVal !== undefined &&
        obj.StringValSub !== undefined &&
        obj.Duration !== undefined &&
        obj.IntVal !== undefined
    );
}

export function isValidScript(script: any): boolean {
    const snippetValid = script.Snippets && script.Snippets.every(isObjSnippet);
    const talkDataValid = script.TalkData && script.TalkData.every(isObjTalkData);
    const specialValid = script.SpecialEffectData && script.SpecialEffectData.every(isObjSpecialEffectData);
    return script.ScenarioId !== undefined && snippetValid && talkDataValid && specialValid;
}

export function buildTranslateData(script: IScript) {
    const getShakeIndex = (script: IScript) => {
        const shakeIndex: number[] = [];
        let talkDataCount = 0;
        let spEffCount = 0;
        let shaking = false;
        script.Snippets.forEach((snippet) => {
            switch (snippet.Action) {
                case 1:
                    if (shaking) {
                        shakeIndex.push(talkDataCount);
                    }
                    talkDataCount += 1;
                    break
                case 6:
                    let effectData = script.SpecialEffectData[spEffCount];
                    switch (effectData.EffectType) {
                        case 6:
                            shakeIndex.push(talkDataCount - 1);
                            if (effectData.Duration > 10) shaking = true;
                            break
                        case 26:
                            shaking = false;
                            break
                    }

            }
        })
        return shakeIndex
    }
    const shakeIndex = getShakeIndex(script);

    const snippets: ISnippet[] = []
    let seCount = 0;

    script.Snippets.forEach(snippet => {
        switch (snippet.Action) {
            case 1:
                snippets.push(snippet)
                break;
            case 6:
                let effectData = script.SpecialEffectData[seCount];
                switch (effectData.EffectType) {
                    case 8:
                    case 18:
                        snippets.push(snippet)
                        break;
                }
                seCount += 1;
                break;
        }
    })
    script.Snippets = snippets;
    script.SpecialEffectData = script.SpecialEffectData.filter(effect => effect.EffectType == 8 || effect.EffectType == 18)

    // const eventId =  script.ScenarioId.startsWith("event") ? parseInt(script.ScenarioId.split('_')[1]) : 0
    // const isEvent = (_ :ITalkData)=>false

    const isShake = (index: number) => shakeIndex.includes(index)


    const data: ITranslateItem[] = []

    let dialogCount = 0
    let effectCount = 0;

    script.Snippets.forEach(snippets => {
        switch (snippets.Action) {
            case 1:
                const talkData = script.TalkData[dialogCount];
                if (dialogCount < script.TalkData.length) {
                    const item: IDialogItem = {
                        id: dialogCount,
                        type: "dialog",
                        speakerId: getCharacterId(talkData),
                        speaker: {origin: talkData.WindowDisplayName, translated: talkData.WindowDisplayName},
                        content: {origin: talkData.Body, translated: ""},
                        isShake: isShake(dialogCount),
                        isFlashBack: false,
                        isClose: talkData.WhenFinishCloseWindow == 1
                    }
                    data.push(item)
                }
                dialogCount += 1;
                break;
            case 6:
                const effectData = script.SpecialEffectData[effectCount];
                switch (effectData.EffectType) {
                    case 8:
                    case 18:
                        const item: ITranslateItem = {
                            id: effectCount, type: "effect",
                            content: {origin: effectData.StringVal, translated: effectData.StringVal}
                        }
                        data.push(item)
                        break;
                }
                effectCount += 1;
                break
        }
    })

    return data
}

export const isSameStructure = (a: ITranslateItem[], b: ITranslateItem[]) => {
    if (a.length != b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i].type != b[i].type) return false
    }
    return true
}

export function mergeTranslate(base: ITranslateItem[], apply: ITranslateItem[]) {
    if (isSameStructure(base, apply)) {
        for (let i = 0; i < base.length; i++) {
            base[i].content.translated = apply[i].content.translated
            if (base[i].type == "dialog") {
                (base[i] as IDialogItem).speaker.translated = (apply[i] as IDialogItem).speaker.translated
            }
        }
    }
    return base
}

export function mergeComparison(base: ITranslateItem[], apply: ITranslateItem[]) {
    if (isSameStructure(base, apply)) {
        for (let i = 0; i < base.length; i++) {
            base[i].content.comparison = apply[i].content.translated
            if (base[i].type == "dialog") {
                (base[i] as IDialogItem).speaker.comparison = (apply[i] as IDialogItem).speaker.translated
            }
        }
    }
    return base
}
