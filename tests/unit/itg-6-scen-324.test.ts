import { generatePainPriorityMatrix } from "../../src/logic/it-8-1-1-1";

describe("ペイン要因の優先度マトリクス生成機能", () => {
  test("SCEN-324: 同一象限に複数配置されたペイン要因が正しく可視化される", () => {
    // テストデータ: 同一象限（高重要度×高頻度）に3件以上のペイン要因を準備
    const painFactors = [
      {
        id: "pf-001",
        name: "食材制限対応の複雑さ",
        frequency: 85,
        impact: 82,
        quadrant: "high-high",
      },
      {
        id: "pf-002",
        name: "調理時間の制約",
        frequency: 88,
        impact: 79,
        quadrant: "high-high",
      },
      {
        id: "pf-003",
        name: "予算内での献立生成",
        frequency: 80,
        impact: 86,
        quadrant: "high-high",
      },
      {
        id: "pf-004",
        name: "家族の好み反映",
        frequency: 45,
        impact: 72,
        quadrant: "high-low",
      },
      {
        id: "pf-005",
        name: "栄養バランス調整",
        frequency: 35,
        impact: 55,
        quadrant: "mid-low",
      },
    ];

    // ペイン要因の優先度マトリクス生成機能を呼び出す
    const matrixResult = generatePainPriorityMatrix(painFactors);

    // 生成されたマトリクスデータが正しく生成されていることを確認
    expect(matrixResult).toBeDefined();
    expect(matrixResult.quadrants).toBeDefined();

    // 同一象限内に複数のペイン要因が正しく配置されていることを確認
    const highHighQuadrant = matrixResult.quadrants.find(
      (q) => q.quadrant === "high-high"
    );
    expect(highHighQuadrant).toBeDefined();
    expect(highHighQuadrant.factors.length).toBe(3);

    // 各ペイン要因のX座標（重要度）とY座標（頻度）の値が想定範囲内であることを検証
    const highHighFactors = highHighQuadrant.factors;

    // 最初の要因（食材制限対応の複雑さ）
    expect(highHighFactors[0]).toEqual({
      id: "pf-001",
      name: "食材制限対応の複雑さ",
      x: 82,
      y: 85,
      quadrant: "high-high",
    });
    expect(highHighFactors[0].x).toBeGreaterThanOrEqual(75);
    expect(highHighFactors[0].x).toBeLessThanOrEqual(100);
    expect(highHighFactors[0].y).toBeGreaterThanOrEqual(75);
    expect(highHighFactors[0].y).toBeLessThanOrEqual(100);

    // 2番目の要因（調理時間の制約）
    expect(highHighFactors[1]).toEqual({
      id: "pf-002",
      name: "調理時間の制約",
      x: 79,
      y: 88,
      quadrant: "high-high",
    });
    expect(highHighFactors[1].x).toBeGreaterThanOrEqual(75);
    expect(highHighFactors[1].x).toBeLessThanOrEqual(100);
    expect(highHighFactors[1].y).toBeGreaterThanOrEqual(75);
    expect(highHighFactors[1].y).toBeLessThanOrEqual(100);

    // 3番目の要因（予算内での献立生成）
    expect(highHighFactors[2]).toEqual({
      id: "pf-003",
      name: "予算内での献立生成",
      x: 86,
      y: 80,
      quadrant: "high-high",
    });
    expect(highHighFactors[2].x).toBeGreaterThanOrEqual(75);
    expect(highHighFactors[2].x).toBeLessThanOrEqual(100);
    expect(highHighFactors[2].y).toBeGreaterThanOrEqual(75);
    expect(highHighFactors[2].y).toBeLessThanOrEqual(100);

    // マトリクス内で同一象限の複数要因が重複せず、個別に識別可能であることを確認
    const highHighCoordinates = highHighFactors.map((f) => `${f.x},${f.y}`);
    const uniqueCoordinates = new Set(highHighCoordinates);
    expect(uniqueCoordinates.size).toBe(3);

    // 各要因のIDが一意であることを確認
    const highHighIds = highHighFactors.map((f) => f.id);
    const uniqueIds = new Set(highHighIds);
    expect(uniqueIds.size).toBe(3);

    // 他の象限に配置されたペイン要因が正しく分類されていることを確認
    const highLowQuadrant = matrixResult.quadrants.find(
      (q) => q.quadrant === "high-low"
    );
    expect(highLowQuadrant).toBeDefined();
    expect(highLowQuadrant.factors.length).toBe(1);
    expect(highLowQuadrant.factors[0]).toEqual({
      id: "pf-004",
      name: "家族の好み反映",
      x: 72,
      y: 45,
      quadrant: "high-low",
    });

    const midLowQuadrant = matrixResult.quadrants.find(
      (q) => q.quadrant === "mid-low"
    );
    expect(midLowQuadrant).toBeDefined();
    expect(midLowQuadrant.factors.length).toBe(1);
    expect(midLowQuadrant.factors[0]).toEqual({
      id: "pf-005",
      name: "栄養バランス調整",
      x: 55,
      y: 35,
      quadrant: "mid-low",
    });

    // マトリクスの総要因数が正しいことを確認
    const totalFactors = matrixResult.quadrants.reduce(
      (sum, q) => sum + q.factors.length,
      0
    );
    expect(totalFactors).toBe(5);

    // マトリクスの可視化プロパティが存在することを確認
    expect(matrixResult.layout).toBeDefined();
    expect(matrixResult.layout.width).toBeGreaterThan(0);
    expect(matrixResult.layout.height).toBeGreaterThan(0);
    expect(matrixResult.layout.spacing).toBeGreaterThanOrEqual(0);

    // 他の象限との相対的な位置関係が正確であることを検証
    // 高-高象限のY座標の最小値が、高-低象限のY座標の最大値より大きい
    const minYHighHigh = Math.min(...highHighFactors.map((f) => f.y));
    const maxYHighLow = Math.max(...highLowQuadrant.factors.map((f) => f.y));
    expect(minYHighHigh).toBeGreaterThan(maxYHighLow);

    // 高-高象限のX座標の最小値が、中-低象限のX座標の最大値より大きい
    const minXHighHigh = Math.min(...highHighFactors.map((f) => f.x));
    const maxXMidLow = Math.max(...midLowQuadrant.factors.map((f) => f.x));
    expect(minXHighHigh).toBeGreaterThan(maxXMidLow);

    // マトリクスのメタデータが正しく生成されていることを確認
    expect(matrixResult.metadata).toBeDefined();
    expect(matrixResult.metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(matrixResult.metadata.totalFactors).toBe(5);
    expect(matrixResult.metadata.quadrantDistribution).toEqual({
      "high-high": 3,
      "high-low": 1,
      "mid-low": 1,
    });

    // 同一象限内の要因がスペーシングされていることを確認（最小距離）
    for (let i = 0; i < highHighFactors.length; i++) {
      for (let j = i + 1; j < highHighFactors.length; j++) {
        const factor1 = highHighFactors[i];
        const factor2 = highHighFactors[j];
        const distance = Math.sqrt(
          Math.pow(factor1.x - factor2.x, 2) + Math.pow(factor1.y - factor2.y, 2)
        );
        expect(distance).toBeGreaterThanOrEqual(5);
      }
    }
  });
});