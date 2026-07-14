import {
  calculatePriorityMatrixPlacement,
} from "../../src/logic/it-7-2-1";

describe("外部要因変数の優先度マトリクス配置機能", () => {
  // SCEN-813: [normal] 外部要因変数の優先度マトリクス配置機能
  test("月次需要予測検証完了後、特定された外部要因変数が影響度と実装難度の2軸で正しく優先度マトリクスに配置される", () => {
    // テスト入力: 月次需要予測検証完了後に特定された外部要因変数リスト
    const external_factor_variables = [
      {
        variable_id: "VAR_001",
        variable_name: "季節性",
        impact_score: 85,
        implementation_difficulty_score: 35,
      },
      {
        variable_id: "VAR_002",
        variable_name: "競合価格",
        impact_score: 72,
        implementation_difficulty_score: 65,
      },
      {
        variable_id: "VAR_003",
        variable_name: "プロモーション",
        impact_score: 68,
        implementation_difficulty_score: 45,
      },
      {
        variable_id: "VAR_004",
        variable_name: "天候",
        impact_score: 55,
        implementation_difficulty_score: 28,
      },
      {
        variable_id: "VAR_005",
        variable_name: "イベント",
        impact_score: 62,
        implementation_difficulty_score: 72,
      },
    ];

    // 処理実行
    const result = calculatePriorityMatrixPlacement(
      external_factor_variables
    );

    // 期待結果: すべての外部要因変数がマトリクスに配置されている
    expect(result.matrix_placements).toHaveLength(5);

    // 期待結果: 各変数が正しい象限に分類されている
    const placements = result.matrix_placements;

    // 季節性（影響度85、実装難度35）-> 右上象限（高優先度）
    const seasonality_placement = placements.find(
      (p: any) => p.variable_id === "VAR_001"
    );
    expect(seasonality_placement).toBeDefined();
    expect(seasonality_placement.impact_score).toBe(85);
    expect(seasonality_placement.implementation_difficulty_score).toBe(35);
    expect(seasonality_placement.quadrant).toBe("high_priority");
    expect(seasonality_placement.priority_rank).toBe(1);

    // 競合価格（影響度72、実装難度65）-> 左上象限（中優先度）
    const competitor_price_placement = placements.find(
      (p: any) => p.variable_id === "VAR_002"
    );
    expect(competitor_price_placement).toBeDefined();
    expect(competitor_price_placement.impact_score).toBe(72);
    expect(competitor_price_placement.implementation_difficulty_score).toBe(65);
    expect(competitor_price_placement.quadrant).toBe("medium_priority");
    expect(competitor_price_placement.priority_rank).toBe(3);

    // プロモーション（影響度68、実装難度45）-> 右上象限（高優先度）
    const promotion_placement = placements.find(
      (p: any) => p.variable_id === "VAR_003"
    );
    expect(promotion_placement).toBeDefined();
    expect(promotion_placement.impact_score).toBe(68);
    expect(promotion_placement.implementation_difficulty_score).toBe(45);
    expect(promotion_placement.quadrant).toBe("high_priority");
    expect(promotion_placement.priority_rank).toBe(2);

    // 天候（影響度55、実装難度28）-> 右下象限（低優先度）
    const weather_placement = placements.find(
      (p: any) => p.variable_id === "VAR_004"
    );
    expect(weather_placement).toBeDefined();
    expect(weather_placement.impact_score).toBe(55);
    expect(weather_placement.implementation_difficulty_score).toBe(28);
    expect(weather_placement.quadrant).toBe("low_priority");
    expect(weather_placement.priority_rank).toBe(5);

    // イベント（影響度62、実装難度72）-> 左上象限（中優先度）
    const event_placement = placements.find(
      (p: any) => p.variable_id === "VAR_005"
    );
    expect(event_placement).toBeDefined();
    expect(event_placement.impact_score).toBe(62);
    expect(event_placement.implementation_difficulty_score).toBe(72);
    expect(event_placement.quadrant).toBe("medium_priority");
    expect(event_placement.priority_rank).toBe(4);

    // 期待結果: マトリクスメタデータが正しく設定されている
    expect(result.matrix_metadata).toBeDefined();
    expect(result.matrix_metadata.x_axis_label).toBe("実装難度");
    expect(result.matrix_metadata.y_axis_label).toBe("影響度");
    expect(result.matrix_metadata.x_axis_min).toBe(0);
    expect(result.matrix_metadata.x_axis_max).toBe(100);
    expect(result.matrix_metadata.y_axis_min).toBe(0);
    expect(result.matrix_metadata.y_axis_max).toBe(100);

    // 期待結果: 象限の閾値が正しく設定されている
    expect(result.matrix_metadata.impact_threshold).toBe(60);
    expect(result.matrix_metadata.difficulty_threshold).toBe(50);

    // 期待結果: マトリクスデータの一貫性を検証
    expect(result.validation_status).toBe("valid");
    expect(result.total_variables_processed).toBe(5);
    expect(result.total_variables_placed).toBe(5);

    // 期待結果: マトリクス上の象限分布
    expect(result.quadrant_distribution).toBeDefined();
    expect(result.quadrant_distribution.high_priority).toBe(2); // 季節性、プロモーション
    expect(result.quadrant_distribution.medium_priority).toBe(2); // 競合価格、イベント
    expect(result.quadrant_distribution.low_priority).toBe(1); // 天候

    // 期待結果: 優先度ランキングが正しい順序で設定されている
    expect(result.priority_ranking).toHaveLength(5);
    expect(result.priority_ranking[0].variable_id).toBe("VAR_001"); // 季節性（最優先）
    expect(result.priority_ranking[1].variable_id).toBe("VAR_003"); // プロモーション
    expect(result.priority_ranking[2].variable_id).toBe("VAR_002"); // 競合価格
    expect(result.priority_ranking[3].variable_id).toBe("VAR_005"); // イベント
    expect(result.priority_ranking[4].variable_id).toBe("VAR_004"); // 天候（最低優先度）
  });
});