import { analyzeFeatureUsageBySegment } from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント分析", () => {
  // SCEN-368
  test("セグメント別の機能使用頻度ランクが発生頻度順に正しく算出される", () => {
    const segmentALogs = [
      { featureId: "feature_a", userId: "user_1", timestamp: "2024-01-15T10:00:00Z" },
      { featureId: "feature_a", userId: "user_2", timestamp: "2024-01-15T10:05:00Z" },
      { featureId: "feature_a", userId: "user_3", timestamp: "2024-01-15T10:10:00Z" },
      { featureId: "feature_b", userId: "user_1", timestamp: "2024-01-15T10:15:00Z" },
      { featureId: "feature_b", userId: "user_2", timestamp: "2024-01-15T10:20:00Z" },
      { featureId: "feature_c", userId: "user_3", timestamp: "2024-01-15T10:25:00Z" },
      { featureId: "feature_d", userId: "user_1", timestamp: "2024-01-15T10:30:00Z" },
      { featureId: "feature_e", userId: "user_2", timestamp: "2024-01-15T10:35:00Z" },
    ];

    const segmentBLogs = [
      { featureId: "feature_b", userId: "user_4", timestamp: "2024-01-15T11:00:00Z" },
      { featureId: "feature_b", userId: "user_5", timestamp: "2024-01-15T11:05:00Z" },
      { featureId: "feature_b", userId: "user_6", timestamp: "2024-01-15T11:10:00Z" },
      { featureId: "feature_b", userId: "user_7", timestamp: "2024-01-15T11:15:00Z" },
      { featureId: "feature_a", userId: "user_4", timestamp: "2024-01-15T11:20:00Z" },
      { featureId: "feature_a", userId: "user_5", timestamp: "2024-01-15T11:25:00Z" },
      { featureId: "feature_c", userId: "user_6", timestamp: "2024-01-15T11:30:00Z" },
      { featureId: "feature_d", userId: "user_7", timestamp: "2024-01-15T11:35:00Z" },
    ];

    const segmentCLogs = [
      { featureId: "feature_c", userId: "user_8", timestamp: "2024-01-15T12:00:00Z" },
      { featureId: "feature_c", userId: "user_9", timestamp: "2024-01-15T12:05:00Z" },
      { featureId: "feature_c", userId: "user_10", timestamp: "2024-01-15T12:10:00Z" },
      { featureId: "feature_c", userId: "user_11", timestamp: "2024-01-15T12:15:00Z" },
      { featureId: "feature_c", userId: "user_12", timestamp: "2024-01-15T12:20:00Z" },
      { featureId: "feature_d", userId: "user_8", timestamp: "2024-01-15T12:25:00Z" },
      { featureId: "feature_d", userId: "user_9", timestamp: "2024-01-15T12:30:00Z" },
      { featureId: "feature_a", userId: "user_10", timestamp: "2024-01-15T12:35:00Z" },
    ];

    const result = analyzeFeatureUsageBySegment([
      {
        segmentId: "segment_a",
        logs: segmentALogs,
      },
      {
        segmentId: "segment_b",
        logs: segmentBLogs,
      },
      {
        segmentId: "segment_c",
        logs: segmentCLogs,
      },
    ]);

    // セグメントAの検証: feature_a(3) > feature_b(2) > feature_c(1) = feature_d(1) = feature_e(1)
    expect(result.segments).toHaveLength(3);
    expect(result.segments[0]).toEqual({
      segmentId: "segment_a",
      featureRankings: [
        { featureId: "feature_a", frequency: 3, rank: 1 },
        { featureId: "feature_b", frequency: 2, rank: 2 },
        { featureId: "feature_c", frequency: 1, rank: 3 },
        { featureId: "feature_d", frequency: 1, rank: 3 },
        { featureId: "feature_e", frequency: 1, rank: 3 },
      ],
    });

    // セグメントBの検証: feature_b(4) > feature_a(2) > feature_c(1) = feature_d(1)
    expect(result.segments[1]).toEqual({
      segmentId: "segment_b",
      featureRankings: [
        { featureId: "feature_b", frequency: 4, rank: 1 },
        { featureId: "feature_a", frequency: 2, rank: 2 },
        { featureId: "feature_c", frequency: 1, rank: 3 },
        { featureId: "feature_d", frequency: 1, rank: 3 },
      ],
    });

    // セグメントCの検証: feature_c(5) > feature_d(2) > feature_a(1)
    expect(result.segments[2]).toEqual({
      segmentId: "segment_c",
      featureRankings: [
        { featureId: "feature_c", frequency: 5, rank: 1 },
        { featureId: "feature_d", frequency: 2, rank: 2 },
        { featureId: "feature_a", frequency: 1, rank: 3 },
      ],
    });

    // 各セグメント間で同一機能のランクが異なることを検証
    const featureASegmentARank = result.segments[0].featureRankings.find(
      (r) => r.featureId === "feature_a"
    )?.rank;
    const featureASegmentBRank = result.segments[1].featureRankings.find(
      (r) => r.featureId === "feature_a"
    )?.rank;
    const featureASegmentCRank = result.segments[2].featureRankings.find(
      (r) => r.featureId === "feature_a"
    )?.rank;

    expect(featureASegmentARank).toBe(1);
    expect(featureASegmentBRank).toBe(2);
    expect(featureASegmentCRank).toBe(3);
    expect(new Set([featureASegmentARank, featureASegmentBRank, featureASegmentCRank]).size).toBe(3);

    // feature_cについても異なるランクを確認
    const featureCSegmentARank = result.segments[0].featureRankings.find(
      (r) => r.featureId === "feature_c"
    )?.rank;
    const featureCSegmentBRank = result.segments[1].featureRankings.find(
      (r) => r.featureId === "feature_c"
    )?.rank;
    const featureCSegmentCRank = result.segments[2].featureRankings.find(
      (r) => r.featureId === "feature_c"
    )?.rank;

    expect(featureCSegmentARank).toBe(3);
    expect(featureCSegmentBRank).toBe(3);
    expect(featureCSegmentCRank).toBe(1);

    // 発生頻度が同じ機能の順序が一貫していることを検証
    // セグメントAでfeature_c, feature_d, feature_eは全て頻度1で同じランク3
    const segmentAEqualFreqFeatures = result.segments[0].featureRankings.filter(
      (r) => r.frequency === 1
    );
    expect(segmentAEqualFreqFeatures.length).toBe(3);
    expect(segmentAEqualFreqFeatures.every((r) => r.rank === 3)).toBe(true);

    // セグメントBでfeature_c, feature_dは全て頻度1で同じランク3
    const segmentBEqualFreqFeatures = result.segments[1].featureRankings.filter(
      (r) => r.frequency === 1
    );
    expect(segmentBEqualFreqFeatures.length).toBe(2);
    expect(segmentBEqualFreqFeatures.every((r) => r.rank === 3)).toBe(true);

    // ランキング内での順序の一貫性確認（同一ランク内で常に同じ順序）
    const segmentAFeatureOrder = result.segments[0].featureRankings.map((r) => r.featureId);
    const segmentBFeatureOrder = result.segments[1].featureRankings.map((r) => r.featureId);
    expect(segmentAFeatureOrder).toEqual([
      "feature_a",
      "feature_b",
      "feature_c",
      "feature_d",
      "feature_e",
    ]);
    expect(segmentBFeatureOrder).toEqual(["feature_b", "feature_a", "feature_c", "feature_d"]);

    // 全体の構造検証
    expect(result).toHaveProperty("segments");
    expect(result.segments.length).toBe(3);
  });
});