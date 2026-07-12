import { detectOutliers } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-708: [edge] 外れ値検出・品質検証機能 - 献立生成成功率の外れ値判定で限界値（±3σ）ちょうどの場合に正しく境界処理される
  test("献立生成成功率が±3σの限界値ちょうどの場合は正常範囲内、限界値を超える場合は外れ値として判定される", () => {
    // 初期設定：献立生成成功率の統計データ
    const mean = 75; // 平均値
    const stdDev = 10; // 標準偏差

    // テストケース1: 平均値 + 3σ（上限境界値）ちょうどの値
    const upperBoundary = mean + 3 * stdDev; // 75 + 30 = 105
    const result1 = detectOutliers({
      value: upperBoundary,
      mean,
      stdDev,
    });
    // 期待結果：外れ値ではない（isOutlier = false）
    expect(result1.isOutlier).toBe(false);
    expect(result1.value).toBe(105);

    // テストケース2: 平均値 - 3σ（下限境界値）ちょうどの値
    const lowerBoundary = mean - 3 * stdDev; // 75 - 30 = 45
    const result2 = detectOutliers({
      value: lowerBoundary,
      mean,
      stdDev,
    });
    // 期待結果：外れ値ではない（isOutlier = false）
    expect(result2.isOutlier).toBe(false);
    expect(result2.value).toBe(45);

    // テストケース3: ±3σの限界値を超える値（平均値 + 3.01σ）
    const beyondUpperBoundary = mean + 3.01 * stdDev; // 75 + 30.1 = 105.1
    const result3 = detectOutliers({
      value: beyondUpperBoundary,
      mean,
      stdDev,
    });
    // 期待結果：外れ値である（isOutlier = true）
    expect(result3.isOutlier).toBe(true);
    expect(result3.value).toBe(105.1);

    // テストケース4: ±3σの限界値を超える値（平均値 - 3.01σ）
    const beyondLowerBoundary = mean - 3.01 * stdDev; // 75 - 30.1 = 44.9
    const result4 = detectOutliers({
      value: beyondLowerBoundary,
      mean,
      stdDev,
    });
    // 期待結果：外れ値である（isOutlier = true）
    expect(result4.isOutlier).toBe(true);
    expect(result4.value).toBe(44.9);

    // テストケース5: 平均値内の正常値
    const normalValue = 80;
    const result5 = detectOutliers({
      value: normalValue,
      mean,
      stdDev,
    });
    // 期待結果：外れ値ではない（isOutlier = false）
    expect(result5.isOutlier).toBe(false);
    expect(result5.value).toBe(80);
  });
});