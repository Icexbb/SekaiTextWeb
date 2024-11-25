interface IUnitStoryEpisode {
    id: number
    unitStoryEpisodeGroupId: number
    chapterNo: number
    episodeNo: number
    episodeNoLabel: string,
    title: string,
    assetbundleName: string,
    scenarioId: string,
    releaseConditionId: number,
    rewardResourceBoxIds: number[]
}

interface IUnitStoryChapter {
    id: number
    unit: string
    chapterNo: number
    title: string
    assetbundleName: string
    episodes: IUnitStoryEpisode[]
}

export default interface IUnitStory {
    unit: string,
    seq: number
    chapters: IUnitStoryChapter[]
}
