import { approveSeasonalPurchasingTrend } from "../../src/logic/it-7-2-1";

describe("購買傾向承認判定機能", () => {
  // SCEN-758
  test("承認判定が YES の場合、次期献立・買い物提案ロジックへの反映が指示される", () => {
    const testTrendData = {
      trendId: "trend_001",
      seasonalPattern: ["spring_vegetables", "summer_fruits"],
      discountThreshold: 15,
      salePeriods: [
        {
          startDate: "2024-03-01",
          endDate: "2024-05-31",
          category: "vegetables",
        },
      ],
      approvalStatus: "pending",
      submittedAt: "2024-02-28T09:00:00Z",
    };

    const result = approveSeasonalPurchasingTrend({
      trendData: testTrendData,
      approvalDecision: "YES",
      approverName: "PM_001",
      approvalTimestamp: "2024-02-28T10:30:00Z",
    });

    // 承認判定結果が YES であることを確認
    expect(result.approvalJudgment).toBe("YES");

    // 反映指示が発行されたことを確認
    expect(result.reflectionInstructionIssued).toBe(true);

    // 反映指示のペイロードに正しい購買傾向データが含まれていることを確認
    expect(result.reflectionPayload).toEqual({
      instructionId: expect.any(String),
      targetModule: "menu_shopping_proposal_logic",
      seasonalPatterns: ["spring_vegetables", "summer_fruits"],
      discountThresholdPercent: 15,
      salePeriods: [
        {
          startDate: "2024-03-01",
          endDate: "2024-05-31",
          category: "vegetables",
        },
      ],
      effectiveDate: "2024-03-01T00:00:00Z",
      priority: "high",
    });

    // 反映指示がシステムの後続モジュールに正常に伝達されたことをログで確認
    expect(result.transmissionLog).toEqual({
      status: "successfully_transmitted",
      targetModule: "menu_shopping_proposal_logic",
      transmissionTimestamp: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      ),
      acknowledgmentReceived: true,
    });

    // 承認者情報がログに記録されていることを確認
    expect(result.auditLog).toEqual({
      approverIdentifier: "PM_001",
      approvalDecisionTime: "2024-02-28T10:30:00Z",
      trendIdentifier: "trend_001",
      decisionReason: "承認判定は YES です。次期献立ロジックに即座に反映します。",
    });
  });
});