import { generatePainPriorityMatrix } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-652
  test("ペイン要因優先度マトリクス生成機能 - インタビュー結果とログデータから発生頻度と影響度の2軸でペイン要因が分類される", () => {
    // インタビュー結果データ: ペイン要因と評価コメント
    const interviewResults = [
      { painFactor: "food_restriction", userCount: 15, comments: "食材制限に対応できていない" },
      { painFactor: "cooking_time", userCount: 22, comments: "調理時間が長すぎる" },
      { painFactor: "budget_constraint", userCount: 18, comments: "予算内で献立が作れない" },
      { painFactor: "family_preference", userCount: 12, comments: "家族の好みが反映されていない" },
      { painFactor: "nutrition_balance", userCount: 8, comments: "栄養バランスが不安定" },
    ];

    // ログデータ: ペイン要因の発生頻度情報
    const logData = {
      food_restriction: { occurrenceCount: 145, totalEvents: 500, impactScore: 85 },
      cooking_time: { occurrenceCount: 189, totalEvents: 500, impactScore: 78 },
      budget_constraint: { occurrenceCount: 112, totalEvents: 500, impactScore: 72 },
      family_preference: { occurrenceCount: 67, totalEvents: 500, impactScore: 65 },
      nutrition_balance: { occurrenceCount: 42, totalEvents: 500, impactScore: 55 },
    };

    // マトリクス生成関数を実行
    const matrix = generatePainPriorityMatrix(interviewResults, logData);

    // 生成されたマトリクスが存在することを確認
    expect(matrix).toBeDefined();
    expect(matrix.quadrants).toBeDefined();

    // 高発生頻度×高影響度領域（右上）のペイン要因を検証
    const highPriorityQuadrant = matrix.quadrants.highFrequencyHighImpact;
    expect(highPriorityQuadrant.painFactors).toEqual(
      expect.arrayContaining(["food_restriction", "cooking_time"])
    );
    expect(highPriorityQuadrant.painFactors.length).toBe(2);

    // 高発生頻度×低影響度領域（右下）のペイン要因を検証
    const mediumPriorityQuadrant = matrix.quadrants.highFrequencyLowImpact;
    expect(mediumPriorityQuadrant.painFactors).toEqual(
      expect.arrayContaining(["budget_constraint"])
    );
    expect(mediumPriorityQuadrant.painFactors.length).toBe(1);

    // 低発生頻度×高影響度領域（左上）のペイン要因を検証
    const lowFrequencyHighImpactQuadrant = matrix.quadrants.lowFrequencyHighImpact;
    expect(lowFrequencyHighImpactQuadrant.painFactors).toEqual(
      expect.arrayContaining(["family_preference"])
    );

    // 低発生頻度×低影響度領域（左下）のペイン要因を検証
    const lowPriorityQuadrant = matrix.quadrants.lowFrequencyLowImpact;
    expect(lowPriorityQuadrant.painFactors).toEqual(
      expect.arrayContaining(["nutrition_balance"])
    );

    // 各ペイン要因の発生頻度スコア（0-100）を検証
    const painFactorScores = matrix.painFactorMetrics;
    expect(painFactorScores.food_restriction.occurrenceFrequency).toBe(29); // 145 / 500 * 100
    expect(painFactorScores.cooking_time.occurrenceFrequency).toBe(38); // 189 / 500 * 100
    expect(painFactorScores.budget_constraint.occurrenceFrequency).toBe(22); // 112 / 500 * 100
    expect(painFactorScores.family_preference.occurrenceFrequency).toBe(13); // 67 / 500 * 100
    expect(painFactorScores.nutrition_balance.occurrenceFrequency).toBe(8); // 42 / 500 * 100

    // 各ペイン要因の影響度スコアを検証
    expect(painFactorScores.food_restriction.impactScore).toBe(85);
    expect(painFactorScores.cooking_time.impactScore).toBe(78);
    expect(painFactorScores.budget_constraint.impactScore).toBe(72);
    expect(painFactorScores.family_preference.impactScore).toBe(65);
    expect(painFactorScores.nutrition_balance.impactScore).toBe(55);

    // マトリクスのメタデータを検証
    expect(matrix.metadata.generatedAt).toBeDefined();
    expect(matrix.metadata.totalPainFactors).toBe(5);
    expect(matrix.metadata.interviewSampleSize).toBe(75); // 15+22+18+12+8
    expect(matrix.metadata.logDataPeriod).toBeDefined();

    // エクスポート形式の確認
    expect(matrix.exportFormats).toEqual(
      expect.objectContaining({
        csv: expect.any(String),
        json: expect.any(Object),
      })
    );

    // CSV形式が正しくフォーマットされていることを確認
    expect(matrix.exportFormats.csv).toContain("pain_factor");
    expect(matrix.exportFormats.csv).toContain("occurrence_frequency");
    expect(matrix.exportFormats.csv).toContain("impact_score");
    expect(matrix.exportFormats.csv).toContain("food_restriction");
    expect(matrix.exportFormats.csv).toContain("cooking_time");

    // 優先度マトリクスの軸のスケーリングを検証
    expect(matrix.axes.frequencyAxis.min).toBe(0);
    expect(matrix.axes.frequencyAxis.max).toBe(100);
    expect(matrix.axes.impactAxis.min).toBe(0);
    expect(matrix.axes.impactAxis.max).toBe(100);

    // 閾値設定を検証
    expect(matrix.thresholds.frequencyThreshold).toBe(25); // 中央値ベース
    expect(matrix.thresholds.impactThreshold).toBe(70);

    // すべてのペイン要因が分類されていることを確認
    const allClassifiedPainFactors = [
      ...highPriorityQuadrant.painFactors,
      ...mediumPriorityQuadrant.painFactors,
      ...lowFrequencyHighImpactQuadrant.painFactors,
      ...lowPriorityQuadrant.painFactors,
    ].sort();
    expect(allClassifiedPainFactors).toEqual([
      "budget_constraint",
      "cooking_time",
      "family_preference",
      "food_restriction",
      "nutrition_balance",
    ]);

    // インタビュー結果とログデータの整合性を検証
    expect(matrix.dataIntegrity.interviewDataProcessed).toBe(true);
    expect(matrix.dataIntegrity.logDataProcessed).toBe(true);
    expect(matrix.dataIntegrity.missingDataDetected).toBe(false);
  });
});