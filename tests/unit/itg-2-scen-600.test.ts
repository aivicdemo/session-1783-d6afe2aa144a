import { generatePriorityMatrix } from "../../src/logic/it-1-br-2-1-1-1";

describe("失敗パターンの優先度マトリクス生成 - エラーハンドリング", () => {
  // SCEN-600
  test("失敗パターンデータが空の場合にエラーハンドリングされる", () => {
    const emptyFailurePatterns: Array<{
      patternId: string;
      category: string;
      frequency: number;
      impactScore: number;
    }> = [];

    const input = {
      failurePatterns: emptyFailurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    expect(() => generatePriorityMatrix(input)).toThrow(/データが利用できません/);
  });

  test("失敗パターンデータが存在する場合にマトリクスを正常生成", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: 15,
        impactScore: 8,
      },
      {
        patternId: "FP002",
        category: "家族好み未反映",
        frequency: 12,
        impactScore: 7,
      },
      {
        patternId: "FP003",
        category: "調理時間超過",
        frequency: 8,
        impactScore: 5,
      },
      {
        patternId: "FP004",
        category: "食材制限漏れ",
        frequency: 10,
        impactScore: 9,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    const result = generatePriorityMatrix(input);

    expect(result).toEqual({
      matrixId: expect.any(String),
      generatedAt: "2024-01-15T11:00:00Z",
      quadrants: {
        high_impact_high_frequency: [
          {
            patternId: "FP001",
            category: "栄養バランス",
            priorityRank: "高",
            frequency: 15,
            impactScore: 8,
          },
          {
            patternId: "FP004",
            category: "食材制限漏れ",
            priorityRank: "高",
            frequency: 10,
            impactScore: 9,
          },
        ],
        high_impact_low_frequency: [
          {
            patternId: "FP002",
            category: "家族好み未反映",
            priorityRank: "中",
            frequency: 12,
            impactScore: 7,
          },
        ],
        low_impact_high_frequency: [
          {
            patternId: "FP003",
            category: "調理時間超過",
            priorityRank: "中",
            frequency: 8,
            impactScore: 5,
          },
        ],
        low_impact_low_frequency: [],
      },
      summary: {
        totalPatterns: 4,
        highPriorityCount: 2,
        mediumPriorityCount: 2,
        lowPriorityCount: 0,
      },
    });
  });

  test("失敗パターン数が1件の場合にマトリクスを生成", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: 20,
        impactScore: 9,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    const result = generatePriorityMatrix(input);

    expect(result.summary.totalPatterns).toBe(1);
    expect(result.summary.highPriorityCount).toBe(1);
    expect(result.quadrants.high_impact_high_frequency).toHaveLength(1);
  });

  test("frequency が0の失敗パターンは低頻度として分類", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: 0,
        impactScore: 8,
      },
      {
        patternId: "FP002",
        category: "調理時間超過",
        frequency: 20,
        impactScore: 3,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    const result = generatePriorityMatrix(input);

    const highImpactLowFreq = result.quadrants.high_impact_low_frequency;
    expect(
      highImpactLowFreq.some((p) => p.patternId === "FP001")
    ).toBe(true);
  });

  test("impactScore が低い失敗パターンは低インパクトとして分類", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "軽微な問題",
        frequency: 25,
        impactScore: 2,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    const result = generatePriorityMatrix(input);

    const lowImpactHighFreq = result.quadrants.low_impact_high_frequency;
    expect(
      lowImpactHighFreq.some((p) => p.patternId === "FP001")
    ).toBe(true);
  });

  test("timestampが無効な形式の場合にエラー", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: 10,
        impactScore: 8,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "invalid-timestamp",
    };

    expect(() => generatePriorityMatrix(input)).toThrow(/タイムスタンプ/);
  });

  test("frequency が負数の場合にエラー", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: -5,
        impactScore: 8,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    expect(() => generatePriorityMatrix(input)).toThrow(/frequency/);
  });

  test("impactScore が範囲外の場合にエラー", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: 10,
        impactScore: 15,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    expect(() => generatePriorityMatrix(input)).toThrow(/impactScore/);
  });

  test("quadrants内の高優先度パターンが正しく集計される", () => {
    const failurePatterns = [
      {
        patternId: "FP001",
        category: "栄養バランス",
        frequency: 18,
        impactScore: 8,
      },
      {
        patternId: "FP002",
        category: "家族好み未反映",
        frequency: 22,
        impactScore: 9,
      },
      {
        patternId: "FP003",
        category: "調理時間超過",
        frequency: 5,
        impactScore: 4,
      },
    ];

    const input = {
      failurePatterns: failurePatterns,
      timestamp: "2024-01-15T11:00:00Z",
    };

    const result = generatePriorityMatrix(input);

    expect(result.quadrants.high_impact_high_frequency).toHaveLength(2);
    expect(result.summary.highPriorityCount).toBe(2);
  });
});