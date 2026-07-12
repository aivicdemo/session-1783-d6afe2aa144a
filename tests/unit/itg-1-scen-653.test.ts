import { generatePainFactorPriorityMatrix } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-653: [error] ペイン要因優先度マトリクス生成機能 - ペイン要因データセットが空の場合にエラーが発生する
  test("ペイン要因データセットが空の場合、エラーが発生して処理が中断される", () => {
    const emptyPainFactorDataset: Array<{
      painFactorId: string;
      occurrenceFrequency: number;
      impactDegree: number;
      description: string;
    }> = [];

    expect(() => {
      generatePainFactorPriorityMatrix(emptyPainFactorDataset);
    }).toThrow(/ペイン要因データ/);
  });

  test("ペイン要因データが正常に存在する場合、優先度マトリクスが生成される", () => {
    const validPainFactorDataset = [
      {
        painFactorId: "pf-001",
        occurrenceFrequency: 0.85,
        impactDegree: 0.9,
        description: "食材制限",
      },
      {
        painFactorId: "pf-002",
        occurrenceFrequency: 0.6,
        impactDegree: 0.75,
        description: "調理時間",
      },
      {
        painFactorId: "pf-003",
        occurrenceFrequency: 0.45,
        impactDegree: 0.5,
        description: "予算制約",
      },
    ];

    const result = generatePainFactorPriorityMatrix(validPainFactorDataset);

    expect(result).toBeDefined();
    expect(result.matrixData).toBeDefined();
    expect(Array.isArray(result.matrixData)).toBe(true);
    expect(result.matrixData.length).toBe(3);

    expect(result.matrixData[0]).toEqual({
      painFactorId: "pf-001",
      occurrenceFrequency: 0.85,
      impactDegree: 0.9,
      priorityScore: 0.765,
      priorityRank: "high",
      description: "食材制限",
    });

    expect(result.matrixData[1]).toEqual({
      painFactorId: "pf-002",
      occurrenceFrequency: 0.6,
      impactDegree: 0.75,
      priorityScore: 0.45,
      priorityRank: "medium",
      description: "調理時間",
    });

    expect(result.matrixData[2]).toEqual({
      painFactorId: "pf-003",
      occurrenceFrequency: 0.45,
      impactDegree: 0.5,
      priorityScore: 0.225,
      priorityRank: "low",
      description: "予算制約",
    });

    expect(result.generatedAt).toEqual(new Date("2024-01-15T12:30:45Z"));
    expect(result.totalPainFactorsAnalyzed).toBe(3);
  });

  test("ペイン要因データセットが null の場合、エラーが発生する", () => {
    expect(() => {
      generatePainFactorPriorityMatrix(null as any);
    }).toThrow(/ペイン要因データ/);
  });

  test("ペイン要因データセットが undefined の場合、エラーが発生する", () => {
    expect(() => {
      generatePainFactorPriorityMatrix(undefined as any);
    }).toThrow(/ペイン要因データ/);
  });

  test("優先度スコア計算の正確性：複数ペイン要因の優先度が occurrence × impact で正確に算出される", () => {
    const painFactorDataset = [
      {
        painFactorId: "pf-high",
        occurrenceFrequency: 0.9,
        impactDegree: 0.9,
        description: "高優先度",
      },
      {
        painFactorId: "pf-medium",
        occurrenceFrequency: 0.5,
        impactDegree: 0.6,
        description: "中優先度",
      },
    ];

    const result = generatePainFactorPriorityMatrix(painFactorDataset);

    expect(result.matrixData[0].priorityScore).toBe(0.81);
    expect(result.matrixData[1].priorityScore).toBe(0.3);
  });

  test("優先度ランク判定：高優先度（0.6以上）、中優先度（0.3～0.6未満）、低優先度（0.3未満）が正確に付与される", () => {
    const painFactorDataset = [
      {
        painFactorId: "pf-001",
        occurrenceFrequency: 1.0,
        impactDegree: 0.75,
        description: "高",
      },
      {
        painFactorId: "pf-002",
        occurrenceFrequency: 0.8,
        impactDegree: 0.4,
        description: "中",
      },
      {
        painFactorId: "pf-003",
        occurrenceFrequency: 0.4,
        impactDegree: 0.5,
        description: "低",
      },
    ];

    const result = generatePainFactorPriorityMatrix(painFactorDataset);

    expect(result.matrixData[0].priorityScore).toBe(0.75);
    expect(result.matrixData[0].priorityRank).toBe("high");

    expect(result.matrixData[1].priorityScore).toBe(0.32);
    expect(result.matrixData[1].priorityRank).toBe("medium");

    expect(result.matrixData[2].priorityScore).toBe(0.2);
    expect(result.matrixData[2].priorityRank).toBe("low");
  });

  test("ペイン要因が1件のみの場合、単一要素の優先度マトリクスが生成される", () => {
    const singlePainFactorDataset = [
      {
        painFactorId: "pf-single",
        occurrenceFrequency: 0.7,
        impactDegree: 0.8,
        description: "単一ペイン要因",
      },
    ];

    const result = generatePainFactorPriorityMatrix(singlePainFactorDataset);

    expect(result.matrixData.length).toBe(1);
    expect(result.matrixData[0].priorityScore).toBe(0.56);
    expect(result.matrixData[0].priorityRank).toBe("medium");
    expect(result.totalPainFactorsAnalyzed).toBe(1);
  });

  test("マトリクス生成タイムスタンプが正確に記録される", () => {
    const validPainFactorDataset = [
      {
        painFactorId: "pf-001",
        occurrenceFrequency: 0.5,
        impactDegree: 0.5,
        description: "テスト",
      },
    ];

    const result = generatePainFactorPriorityMatrix(validPainFactorDataset);

    expect(result.generatedAt).toEqual(new Date("2024-01-15T12:30:45Z"));
    expect(typeof result.generatedAt.getTime()).toBe("number");
  });
});