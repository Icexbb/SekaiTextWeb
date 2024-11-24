interface IEventRankingReward {
    id: number;
    eventRankingRewardRangeId: number;
    resourceBoxId: number;
}

interface IEventRankingRewardRange {
    id: number;
    eventId: number;
    fromRank: number;
    toRank: number;
    isToRankBorder: boolean;
    eventRankingRewards: IEventRankingReward[];
}


export default interface IEvent {
    id: number;
    eventType: string;
    name: string;
    assetbundleName: string;
    bgmAssetbundleName: string;
    eventOnlyComponentDisplayStartAt: number;
    startAt: number;
    aggregateAt: number;
    rankingAnnounceAt: number;
    distributionStartAt: number;
    eventOnlyComponentDisplayEndAt: number;
    closedAt: number;
    distributionEndAt: number;
    virtualLiveId: number;
    unit: string;
    eventRankingRewardRanges: IEventRankingRewardRange[];
}
