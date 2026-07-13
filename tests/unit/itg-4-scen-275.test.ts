import { assignTrustScoreAndJudgeAdoption } from "../../src/logic/it-3-br-6-3-3";

describe("予測精度低下要因の可視化ダッシュボード", () => {
  // SCEN-275: [normal] 外部要因データ信頼度スコア付与・採用判定
  test("外部要因データに信頼度スコアを自動付与し、採用基準に基づいて採用・不採用を判定し、採用データのみを予測モデル入力に含める", () => {
    const external_factor_data_list = [
      {
        external_factor_id: "EF001",
        data_type: "weather",
        data_value: "rainy",
        data_timestamp: "2024-01-15T09:00:00Z",
        source_reliability: 95,
        data_completeness: 100,
        temporal_freshness: 98,
      },
      {
        external_factor_id: "EF002",
        data_type: "event",
        data_value: "holiday_campaign",
        data_timestamp: "2024-01-15T10:30:00Z",
        source_reliability: 85,
        data_completeness: 90,
        temporal_freshness: 75,
      },
      {
        external_factor_id: "EF003",
        data_type: "competitor_measure",
        data_value: "discount_sale",
        data_timestamp: "2024-01-14T15:00:00Z",
        source_reliability: 60,
        data_completeness: 50,
        temporal_freshness: 40,
      },
      {
        external_factor_id: "EF004",
        data_type: "weather",
        data_value: "sunny",
        data_timestamp: "2024-01-15T09:15:00Z",
        source_reliability: 88,
        data_completeness: 95,
        temporal_freshness: 92,
      },
    ];

    const adoption_threshold = 70;

    const result = assignTrustScoreAndJudgeAdoption({
      external_factor_data_list,
      adoption_threshold,
    });

    // ルール: 信頼度スコア = (source_reliability + data_completeness + temporal_freshness) / 3
    // EF001: (95 + 100 + 98) / 3 = 97.67 ≈ 98 (丸め込み)
    // EF002: (85 + 90 + 75) / 3 = 83.33 ≈ 83
    // EF003: (60 + 50 + 40) / 3 = 50 (閾値70未満なので不採用)
    // EF004: (88 + 95 + 92) / 3 = 91.67 ≈ 92 (採用)

    expect(result.scored_external_factors).toHaveLength(4);

    // EF001の信頼度スコア確認
    const ef001_result = result.scored_external_factors.find(
      (item) => item.external_factor_id === "EF001"
    );
    expect(ef001_result).toBeDefined();
    expect(ef001_result?.trust_score).toBe(98);
    expect(ef001_result?.adoption_judgment).toBe("adopted");

    // EF002の信頼度スコア確認
    const ef002_result = result.scored_external_factors.find(
      (item) => item.external_factor_id === "EF002"
    );
    expect(ef002_result).toBeDefined();
    expect(ef002_result?.trust_score).toBe(83);
    expect(ef002_result?.adoption_judgment).toBe("adopted");

    // EF003の信頼度スコア確認（不採用）
    const ef003_result = result.scored_external_factors.find(
      (item) => item.external_factor_id === "EF003"
    );
    expect(ef003_result).toBeDefined();
    expect(ef003_result?.trust_score).toBe(50);
    expect(ef003_result?.adoption_judgment).toBe("rejected");

    // EF004の信頼度スコア確認
    const ef004_result = result.scored_external_factors.find(
      (item) => item.external_factor_id === "EF004"
    );
    expect(ef004_result).toBeDefined();
    expect(ef004_result?.trust_score).toBe(92);
    expect(ef004_result?.adoption_judgment).toBe("adopted");

    // 採用判定されたデータのセット
    expect(result.adopted_factors_for_model_input).toHaveLength(3);
    const adopted_ids = result.adopted_factors_for_model_input.map(
      (item) => item.external_factor_id
    );
    expect(adopted_ids).toContain("EF001");
    expect(adopted_ids).toContain("EF002");
    expect(adopted_ids).toContain("EF004");
    expect(adopted_ids).not.toContain("EF003");

    // 不採用データが除外されていることを確認
    const excluded_ids = result.rejected_factors.map(
      (item) => item.external_factor_id
    );
    expect(excluded_ids).toContain("EF003");
    expect(excluded_ids).not.toContain("EF001");

    // 処理履歴ログの記録確認
    expect(result.processing_history).toBeDefined();
    expect(result.processing_history.processed_count).toBe(4);
    expect(result.processing_history.adopted_count).toBe(3);
    expect(result.processing_history.rejected_count).toBe(1);
    expect(result.processing_history.processing_timestamp).toBeDefined();

    // すべてのスコア付与結果が0～100の範囲内であることを確認
    result.scored_external_factors.forEach((item) => {
      expect(item.trust_score).toBeGreaterThanOrEqual(0);
      expect(item.trust_score).toBeLessThanOrEqual(100);
    });

    // 採用判定結果の値が正しい列挙値であることを確認
    result.scored_external_factors.forEach((item) => {
      expect(["adopted", "rejected"]).toContain(item.adoption_judgment);
    });
  });
});