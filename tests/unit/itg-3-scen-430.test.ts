import { determinePrioritizedImprovementFeatures } from "../../src/logic/it-1-br-3-2-1";

describe("需要予測精度検証と改善実施判定", () => {
  // SCEN-430: [normal] 需要予測精度検証ダッシュボード - 改善実施判定時に複数の改善対象機能が優先度順に決定される
  test("複数の改善対象機能が優先度スコアに基づいて降順に整列され、同一優先度では影響度で二次ソートされる", () => {
    const improvement_features = [
      {
        feature_id: "feat_001",
        feature_name: "気象データ連携",
        accuracy_decline_rate: 15.5,
        impact_score: 85,
        implementation_difficulty: 3,
      },
      {
        feature_id: "feat_002",
        feature_name: "イベント情報連携",
        accuracy_decline_rate: 12.0,
        impact_score: 90,
        implementation_difficulty: 2,
      },
      {
        feature_id: "feat_003",
        feature_name: "競合施策追跡",
        accuracy_decline_rate: 15.5,
        impact_score: 75,
        implementation_difficulty: 4,
      },
      {
        feature_id: "feat_004",
        feature_name: "季節パターン適用",
        accuracy_decline_rate: 8.0,
        impact_score: 65,
        implementation_difficulty: 2,
      },
    ];

    const result = determinePrioritizedImprovementFeatures(
      improvement_features
    );

    // 期待値: 優先度スコア（精度低下率 × 影響度 / 実装難易度）で降順ソート
    // feat_001: (15.5 × 85) / 3 = 440.83
    // feat_002: (12.0 × 90) / 2 = 540.0
    // feat_003: (15.5 × 75) / 4 = 290.63
    // feat_004: (8.0 × 65) / 2 = 260.0
    // 降順: feat_002 (540.0) > feat_001 (440.83) > feat_003 (290.63) > feat_004 (260.0)

    expect(result).toEqual({
      prioritized_features: [
        {
          feature_id: "feat_002",
          feature_name: "イベント情報連携",
          priority_score: 540.0,
          priority_rank: 1,
        },
        {
          feature_id: "feat_001",
          feature_name: "気象データ連携",
          priority_score: 440.833333,
          priority_rank: 2,
        },
        {
          feature_id: "feat_003",
          feature_name: "競合施策追跡",
          priority_score: 290.625,
          priority_rank: 3,
        },
        {
          feature_id: "feat_004",
          feature_name: "季節パターン適用",
          priority_score: 260.0,
          priority_rank: 4,
        },
      ],
      highest_priority_feature: {
        feature_id: "feat_002",
        feature_name: "イベント情報連携",
        priority_score: 540.0,
      },
      total_features_evaluated: 4,
    });

    // 最高優先度の機能が精度低下率が最も高い機能（複数あれば影響度で二次ソート）であることを検証
    expect(result.highest_priority_feature.feature_id).toBe("feat_002");
    expect(result.prioritized_features[0].priority_score).toBeGreaterThan(
      result.prioritized_features[1].priority_score
    );
    expect(result.prioritized_features[1].priority_score).toBeGreaterThan(
      result.prioritized_features[2].priority_score
    );
    expect(result.prioritized_features[2].priority_score).toBeGreaterThan(
      result.prioritized_features[3].priority_score
    );

    // 同一優先度のケース検証: feat_001 と feat_003 は精度低下率が同じ(15.5)だが、影響度で二次ソート
    // feat_001 の影響度(85) > feat_003 の影響度(75) なので feat_001 が先
    const same_decline_rate_features = improvement_features.filter(
      (f) => f.accuracy_decline_rate === 15.5
    );
    expect(same_decline_rate_features.length).toBe(2);

    const feat_001_rank = result.prioritized_features.findIndex(
      (f) => f.feature_id === "feat_001"
    );
    const feat_003_rank = result.prioritized_features.findIndex(
      (f) => f.feature_id === "feat_003"
    );
    expect(feat_001_rank).toBeLessThan(feat_003_rank);

    // エラーケース: 空配列で throw
    expect(() => determinePrioritizedImprovementFeatures([])).toThrow(
      /改善対象機能/
    );

    // エラーケース: null で throw
    expect(() => determinePrioritizedImprovementFeatures(null as any)).toThrow(
      /改善対象機能/
    );

    // エラーケース: 無効な優先度スコア計算（実装難易度が0以下）で throw
    expect(() =>
      determinePrioritizedImprovementFeatures([
        {
          feature_id: "feat_invalid",
          feature_name: "無効な機能",
          accuracy_decline_rate: 10.0,
          impact_score: 80,
          implementation_difficulty: 0,
        },
      ])
    ).toThrow(/実装難易度/);
  });
});