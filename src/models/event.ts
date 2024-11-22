interface EventRankingRewardRange {
    id: number;
    eventId: number;
    fromRank: number;
    toRank: number;
    isToRankBorder: boolean;
    eventRankingRewards: EventRankingReward[];
}

interface EventRankingReward {
    id: number;
    eventRankingRewardRangeId: number;
    resourceBoxId: number;
}

export default interface Event {
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
    eventRankingRewardRanges: EventRankingRewardRange[];
}
