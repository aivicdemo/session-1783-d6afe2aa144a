import { generateFailurePatternPriorityMatrix } from "../../src/logic/it-1-br-2-1-1-1";

describe("失敗パターンの優先度マトリクス生成", () => {
  // SCEN-599
  test("献立却下理由の分類結果から失敗パターンの優先度マトリクスが正しく生成される", () => {
    // 準備: 献立却下理由の分類データ（複数の却下理由カテゴリを含む）
    const rejectionReasons = [
      {
        id: "reason_001",
        category: "nutritionImbalance",
        occurrenceCount: 45,
        impactScore: 8,
        description: "栄養バランス不適切",
      },
      {
        id: "reason_002",
        category: "familyPreference",
        occurrenceCount: 32,
        impactScore: 7,
        description: "家族好み未反映",
      },
      {
        id: "reason_003",
        category: "cookingTimeExceeded",
        occurrenceCount: 28,
        impactScore: 6,
        description: "調理時間超過",
      },
      {
        id: "reason_004",
        category: "allergyMissed",
        occurrenceCount: 52,
        impactScore: 9,
        description: "食材制限漏れ",
      },
      {
        id: "reason_005",
        category: "budgetExceeded",
        occurrenceCount: 18,
        impactScore: 5,
        description: "予算超過",
      },
    ];

    // 実行: 失敗パターンの優先度マトリクス生成機能
    const result = generateFailurePatternPriorityMatrix(rejectionReasons);

    // 検証: 生成されたマトリクスの構造と内容

    // 1. マトリクスが却下理由別に分類されていることを確認
    expect(result.matrix).toBeDefined();
    expect(Array.isArray(result.matrix)).toBe(true);
    expect(result.matrix.length).toBe(5);

    // 2. 各失敗パターンに対して優先度スコアが正しく計算されていることを確認
    // 優先度スコア = (occurrenceCount / maxOccurrenceCount) * 50 + (impactScore / maxImpactScore) * 50
    // maxOccurrenceCount = 52, maxImpactScore = 9
    const expectedScores = [
      {
        category: "allergyMissed",
        priority: Math.round((52 / 52) * 50 + (9 / 9) * 50), // 100
      },
      {
        category: "nutritionImbalance",
        priority: Math.round((45 / 52) * 50 + (8 / 9) * 50), // 82
      },
      {
        category: "familyPreference",
        priority: Math.round((32 / 52) * 50 + (7 / 9) * 50), // 69
      },
      {
        category: "cookingTimeExceeded",
        priority: Math.round((28 / 52) * 50 + (6 / 9) * 50), // 60
      },
      {
        category: "budgetExceeded",
        priority: Math.round((18 / 52) * 50 + (5 / 9) * 50), // 45
      },
    ];

    result.matrix.forEach((pattern: any, index: number) => {
      expect(pattern.priorityScore).toBe(expectedScores[index].priority);
    });

    // 3. マトリクスが発生頻度と影響度の軸で適切にプロット表示されていることを確認
    result.matrix.forEach((pattern: any) => {
      expect(pattern.frequency).toBeDefined();
      expect(pattern.impact).toBeDefined();
      expect(typeof pattern.frequency).toBe("number");
      expect(typeof pattern.impact).toBe("number");
      expect(pattern.frequency).toBeGreaterThan(0);
      expect(pattern.impact).toBeGreaterThan(0);
    });

    // 4. 優先度の高い順に失敗パターンがソートされていることを確認
    for (let i = 0; i < result.matrix.length - 1; i++) {
      expect(result.matrix[i].priorityScore).toBeGreaterThanOrEqual(
        result.matrix[i + 1].priorityScore
      );
    }

    // 5. 生成されたマトリクスデータの出力形式が正しいことを検証
    expect(result.metadata).toBeDefined();
    expect(result.metadata.totalPatterns).toBe(5);
    expect(result.metadata.generatedAt).toBeDefined();
    expect(result.metadata.highPriorityThreshold).toBe(75);
    expect(result.metadata.mediumPriorityThreshold).toBe(50);

    // 各パターンが必須フィールドを持つことを確認
    result.matrix.forEach((pattern: any) => {
      expect(pattern.id).toBeDefined();
      expect(pattern.category).toBeDefined();
      expect(pattern.description).toBeDefined();
      expect(pattern.occurrenceCount).toBeDefined();
      expect(pattern.impactScore).toBeDefined();
      expect(pattern.priorityScore).toBeDefined();
      expect(pattern.priorityRank).toMatch(/high|medium|low/);
    });

    // 優先度ランク付けが正しいことを確認
    expect(result.matrix[0].priorityRank).toBe("high"); // allergyMissed: 100
    expect(result.matrix[1].priorityRank).toBe("high"); // nutritionImbalance: 82
    expect(result.matrix[2].priorityRank).toBe("medium"); // familyPreference: 69
    expect(result.matrix[3].priorityRank).toBe("medium"); // cookingTimeExceeded: 60
    expect(result.matrix[4].priorityRank).toBe("low"); // budgetExceeded: 45

    // 出力形式の完全性を検証
    expect(result.visualization).toBeDefined();
    expect(result.visualization.axes).toBeDefined();
    expect(result.visualization.axes.xAxis).toBe("frequency");
    expect(result.visualization.axes.yAxis).toBe("impact");
    expect(Array.isArray(result.visualization.dataPoints)).toBe(true);
    expect(result.visualization.dataPoints.length).toBe(5);
  });
});