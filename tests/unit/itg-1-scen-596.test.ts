import { validateQualityGate } from "../../src/logic/it-1-1-1";

describe("品質ゲート判定機能", () => {
  // SCEN-596
  test("改善案が定量指標の必須基準を下回る場合、本番昇格判定が不合格と返される", () => {
    // 必須基準値を定義
    const requiredTestCoverage = 80;
    const requiredPerformanceScore = 75;
    const requiredSuccessRate = 85;

    // 改善案データを準備：定量指標を必須基準より低い値で設定
    const improvementProposal = {
      proposalId: "ALG-2024-001",
      algorithmVersion: "v2.1",
      testCoverage: 72, // 必須基準 80 より低い
      performanceScore: 68, // 必須基準 75 より低い
      successRate: 90, // 必須基準 85 以上：OK
      deploymentDate: "2024-02-15T09:00:00Z",
    };

    // 品質ゲート判定を実行
    const result = validateQualityGate(improvementProposal);

    // 期待結果：本番昇格判定が不合格として返される
    expect(result.deploymentApproved).toBe(false);
    expect(result.status).toBe("FAILED");

    // エラーメッセージに基準を下回る項目が詳細に含まれていること
    expect(result.failureDetails).toBeDefined();
    expect(result.failureDetails.length).toBeGreaterThan(0);

    // テストカバレッジの不足を示すメッセージが含まれること
    expect(result.failureDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          metricName: "testCoverage",
          requiredValue: 80,
          actualValue: 72,
        }),
      ])
    );

    // パフォーマンススコアの不足を示すメッセージが含まれること
    expect(result.failureDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          metricName: "performanceScore",
          requiredValue: 75,
          actualValue: 68,
        }),
      ])
    );

    // successRate は基準以上なので failureDetails に含まれないこと
    expect(
      result.failureDetails.some((detail) => detail.metricName === "successRate")
    ).toBe(false);
  });
});