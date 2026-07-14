import { classifyRejectionReasons, aggregateFailurePatterns } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計", () => {
  // SCEN-853: [normal] 却下修正理由カテゴリ分類と失敗パターン集計 - 同一の却下修正理由が複数回発生した場合、失敗パターンとして集計され、重複度スコアが計算される
  test("同一の却下修正理由が複数回発生した場合、失敗パターンとして正しく集計され、重複度スコアが正確に計算・表示される", () => {
    // Arrange: テストデータ準備 - 同一の却下修正理由を複数回（3回以上）発生させるテストデータ
    const rejection_reasons_raw = [
      {
        id: "rej_001",
        user_id: "user_123",
        meal_plan_id: "mp_001",
        reason_text: "ロジックエラーにより献立が家族の栄養基準を満たしていない",
        timestamp: new Date("2024-01-08T10:30:00Z"),
      },
      {
        id: "rej_002",
        user_id: "user_123",
        meal_plan_id: "mp_002",
        reason_text: "ロジックエラーで献立生成に失敗しました",
        timestamp: new Date("2024-01-09T11:15:00Z"),
      },
      {
        id: "rej_003",
        user_id: "user_123",
        meal_plan_id: "mp_003",
        reason_text: "ロジックエラーが発生して提案が不適切です",
        timestamp: new Date("2024-01-10T09:45:00Z"),
      },
      {
        id: "rej_004",
        user_id: "user_124",
        meal_plan_id: "mp_004",
        reason_text: "調理時間が超過したため",
        timestamp: new Date("2024-01-08T14:20:00Z"),
      },
    ];

    // Act: カテゴリ分類を実行
    const classified_reasons = classifyRejectionReasons(rejection_reasons_raw);

    // Assert: カテゴリ分類結果を検証
    expect(classified_reasons).toBeDefined();
    expect(Array.isArray(classified_reasons)).toBe(true);
    expect(classified_reasons.length).toBe(4);

    // 「ロジックエラー」でカテゴリ分類されたデータを確認
    const logic_error_items = classified_reasons.filter(
      (item) => item.category === "ロジックエラー"
    );
    expect(logic_error_items.length).toBe(3);

    // 「調理時間超過」でカテゴリ分類されたデータを確認
    const cooking_time_items = classified_reasons.filter(
      (item) => item.category === "調理時間超過"
    );
    expect(cooking_time_items.length).toBe(1);

    // Act: 失敗パターン集計を実行
    const aggregated_patterns = aggregateFailurePatterns(classified_reasons);

    // Assert: 失敗パターン集計結果を検証
    expect(aggregated_patterns).toBeDefined();
    expect(Array.isArray(aggregated_patterns)).toBe(true);
    expect(aggregated_patterns.length).toBe(2);

    // 「ロジックエラー」パターンを検証
    const logic_error_pattern = aggregated_patterns.find(
      (pattern) => pattern.category === "ロジックエラー"
    );
    expect(logic_error_pattern).toBeDefined();
    expect(logic_error_pattern.occurrence_count).toBe(3);
    expect(logic_error_pattern.duplicate_score).toBe(75);

    // 「調理時間超過」パターンを検証
    const cooking_time_pattern = aggregated_patterns.find(
      (pattern) => pattern.category === "調理時間超過"
    );
    expect(cooking_time_pattern).toBeDefined();
    expect(cooking_time_pattern.occurrence_count).toBe(1);
    expect(cooking_time_pattern.duplicate_score).toBe(25);

    // Assert: 重複度スコアが発生回数に正比例していることを検証
    // 重複度スコア = (該当カテゴリの発生回数 / 全理由件数) × 100
    const expected_logic_error_score = (3 / 4) * 100;
    const expected_cooking_time_score = (1 / 4) * 100;

    expect(logic_error_pattern.duplicate_score).toBe(expected_logic_error_score);
    expect(cooking_time_pattern.duplicate_score).toBe(
      expected_cooking_time_score
    );

    // Assert: スコアの合計が100になることを確認（全体の一貫性チェック）
    const total_score = aggregated_patterns.reduce(
      (sum, pattern) => sum + pattern.duplicate_score,
      0
    );
    expect(total_score).toBe(100);

    // Assert: ダッシュボード出力形式の検証
    // スコアが高い順にソート済みであることを確認
    expect(aggregated_patterns[0].duplicate_score).toBeGreaterThanOrEqual(
      aggregated_patterns[1].duplicate_score
    );

    // Assert: 各パターンが必要なフィールドを保有していることを確認
    aggregated_patterns.forEach((pattern) => {
      expect(pattern).toHaveProperty("category");
      expect(pattern).toHaveProperty("occurrence_count");
      expect(pattern).toHaveProperty("duplicate_score");
      expect(typeof pattern.category).toBe("string");
      expect(typeof pattern.occurrence_count).toBe("number");
      expect(typeof pattern.duplicate_score).toBe("number");
      expect(pattern.occurrence_count).toBeGreaterThan(0);
      expect(pattern.duplicate_score).toBeGreaterThanOrEqual(0);
      expect(pattern.duplicate_score).toBeLessThanOrEqual(100);
    });
  });
});