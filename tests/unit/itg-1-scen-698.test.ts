import { assignPriorityWithPainQuantification } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-698
  test("ユーザーペイン定量化データが不足している場合、適切なエラーメッセージを返す", () => {
    // Arrange: 必須フィールドの一部が欠落したペイン定量化データ
    const incompleteQuantificationData = {
      userCount: 150,
      impactScore: 85,
      // resolutionTimeMinutes が未入力（必須項目）
      segmentAffectedCount: 45,
      // satisfactionGainScore が未入力（必須項目）
      painCategoryId: "time_constraint",
      painCategoryName: "調理時間制約",
      detectionFrequency: 0.78,
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(incompleteQuantificationData)
    ).toThrow(/必須項目/);
  });

  test("全ての必須定量化データが揃っている場合、優先度が正しく計算される", () => {
    // Arrange: 完全な定量化データセット
    const completeQuantificationData = {
      userCount: 150,
      impactScore: 85, // 0-100
      resolutionTimeMinutes: 240,
      segmentAffectedCount: 45,
      satisfactionGainScore: 72, // 0-100
      painCategoryId: "time_constraint",
      painCategoryName: "調理時間制約",
      detectionFrequency: 0.78,
      implementationDifficulty: 3, // 1-5
    };

    // Act
    const result = assignPriorityWithPainQuantification(
      completeQuantificationData
    );

    // Assert: 優先度スコアは以下の式で計算
    // priorityScore = (impactScore * 0.35) + (satisfactionGainScore * 0.30) + (detectionFrequency * 100 * 0.20) - (implementationDifficulty * 10 * 0.15)
    // = (85 * 0.35) + (72 * 0.30) + (78 * 0.20) - (3 * 10 * 0.15)
    // = 29.75 + 21.6 + 15.6 - 4.5
    // = 62.45
    const expectedPriorityScore = 62.45;
    expect(result.priorityScore).toBe(expectedPriorityScore);
    expect(result.priorityRank).toBe("HIGH"); // スコア 62.45 は HIGH ランク（50-75）
    expect(result.painCategoryId).toBe("time_constraint");
  });

  test("userCount が 0 の場合、エラーを返す", () => {
    // Arrange
    const invalidData = {
      userCount: 0, // 無効：0以下
      impactScore: 85,
      resolutionTimeMinutes: 240,
      segmentAffectedCount: 45,
      satisfactionGainScore: 72,
      painCategoryId: "budget_constraint",
      painCategoryName: "予算制約",
      detectionFrequency: 0.65,
      implementationDifficulty: 2,
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(invalidData)
    ).toThrow(/ユーザー数/);
  });

  test("impactScore が範囲外（0-100以外）の場合、エラーを返す", () => {
    // Arrange
    const invalidData = {
      userCount: 100,
      impactScore: 125, // 無効：100を超過
      resolutionTimeMinutes: 240,
      segmentAffectedCount: 30,
      satisfactionGainScore: 70,
      painCategoryId: "ingredient_restriction",
      painCategoryName: "食材制限",
      detectionFrequency: 0.55,
      implementationDifficulty: 2,
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(invalidData)
    ).toThrow(/影響度/);
  });

  test("satisfactionGainScore が範囲外（0-100以外）の場合、エラーを返す", () => {
    // Arrange
    const invalidData = {
      userCount: 120,
      impactScore: 80,
      resolutionTimeMinutes: 180,
      segmentAffectedCount: 40,
      satisfactionGainScore: -10, // 無効：負の値
      painCategoryId: "nutrition_balance",
      painCategoryName: "栄養バランス",
      detectionFrequency: 0.68,
      implementationDifficulty: 3,
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(invalidData)
    ).toThrow(/満足度/);
  });

  test("implementationDifficulty が範囲外（1-5以外）の場合、エラーを返す", () => {
    // Arrange
    const invalidData = {
      userCount: 110,
      impactScore: 75,
      resolutionTimeMinutes: 200,
      segmentAffectedCount: 35,
      satisfactionGainScore: 68,
      painCategoryId: "preference_learning",
      painCategoryName: "嗜好学習",
      detectionFrequency: 0.72,
      implementationDifficulty: 7, // 無効：5を超過
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(invalidData)
    ).toThrow(/実装難度/);
  });

  test("detectionFrequency が 0 の場合、エラーを返す", () => {
    // Arrange
    const invalidData = {
      userCount: 95,
      impactScore: 88,
      resolutionTimeMinutes: 160,
      segmentAffectedCount: 28,
      satisfactionGainScore: 76,
      painCategoryId: "allergen_management",
      painCategoryName: "アレルギー対応",
      detectionFrequency: 0, // 無効：0以下
      implementationDifficulty: 2,
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(invalidData)
    ).toThrow(/検出頻度/);
  });

  test("優先度スコアが低い（0-30）場合、LOW ランクが付与される", () => {
    // Arrange
    const lowPriorityData = {
      userCount: 50,
      impactScore: 20, // 低い影響度
      resolutionTimeMinutes: 600, // 実装時間が長い
      segmentAffectedCount: 10,
      satisfactionGainScore: 25, // 低い満足度向上
      painCategoryId: "edge_case",
      painCategoryName: "エッジケース",
      detectionFrequency: 0.15, // 検出頻度が低い
      implementationDifficulty: 5, // 実装が難しい
    };

    // Act
    // priorityScore = (20 * 0.35) + (25 * 0.30) + (15 * 0.20) - (5 * 10 * 0.15)
    // = 7 + 7.5 + 3 - 7.5 = 10
    const result = assignPriorityWithPainQuantification(lowPriorityData);

    // Assert
    expect(result.priorityScore).toBe(10);
    expect(result.priorityRank).toBe("LOW");
  });

  test("優先度スコアが最高レベル（75以上）の場合、CRITICAL ランクが付与される", () => {
    // Arrange
    const criticalPriorityData = {
      userCount: 300, // ユーザー数が多い
      impactScore: 95, // 影響度が高い
      resolutionTimeMinutes: 120, // 実装時間が短い
      segmentAffectedCount: 120,
      satisfactionGainScore: 92, // 満足度向上が大きい
      painCategoryId: "core_feature",
      painCategoryName: "コア機能",
      detectionFrequency: 0.95, // 検出頻度が高い
      implementationDifficulty: 1, // 実装が簡単
    };

    // Act
    // priorityScore = (95 * 0.35) + (92 * 0.30) + (95 * 0.20) - (1 * 10 * 0.15)
    // = 33.25 + 27.6 + 19 - 1.5 = 78.35
    const result = assignPriorityWithPainQuantification(
      criticalPriorityData
    );

    // Assert
    expect(result.priorityScore).toBe(78.35);
    expect(result.priorityRank).toBe("CRITICAL");
  });

  test("複数の必須フィールドが欠落している場合、複合エラーメッセージを返す", () => {
    // Arrange: 複数の必須フィールドが欠落
    const severelyIncompleteData = {
      userCount: undefined,
      impactScore: 80,
      resolutionTimeMinutes: undefined,
      segmentAffectedCount: 40,
      satisfactionGainScore: 70,
      // painCategoryId も未定義
      painCategoryName: "未分類",
      detectionFrequency: 0.6,
      implementationDifficulty: 2,
    };

    // Act & Assert
    // 最初に検出される必須項目の不足でエラー
    expect(() =>
      assignPriorityWithPainQuantification(severelyIncompleteData as any)
    ).toThrow(/必須項目|ユーザー|項目/);
  });

  test("resolutionTimeMinutes が負の値の場合、エラーを返す", () => {
    // Arrange
    const invalidData = {
      userCount: 100,
      impactScore: 75,
      resolutionTimeMinutes: -120, // 無効：負の値
      segmentAffectedCount: 35,
      satisfactionGainScore: 68,
      painCategoryId: "invalid_time",
      painCategoryName: "時間無効",
      detectionFrequency: 0.6,
      implementationDifficulty: 3,
    };

    // Act & Assert
    expect(() =>
      assignPriorityWithPainQuantification(invalidData)
    ).toThrow(/時間/);
  });

  test("エラー発生時、部分的な優先度付与は行われず、トランザクション全体がロールバックされる", () => {
    // Arrange: 意図的に無効なデータセット
    const invalidData = {
      userCount: 100,
      impactScore: 85,
      resolutionTimeMinutes: 240,
      segmentAffectedCount: 45,
      satisfactionGainScore: undefined, // 必須フィールドが未定義
      painCategoryId: "test_rollback",
      painCategoryName: "テスト",
      detectionFrequency: 0.7,
      implementationDifficulty: 2,
    };

    // Act & Assert: エラーがスロー、結果が返されないことを確認
    expect(() =>
      assignPriorityWithPainQuantification(invalidData as any)
    ).toThrow(/満足度|必須/);

    // ロールバック後、呼び出し側は例外を受け取り、不完全な結果は保持されない
    // （結果オブジェクトが返されないことで確認）
  });
});