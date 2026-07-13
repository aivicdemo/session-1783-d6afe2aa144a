import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-495
  test("改善提案優先度付け - 提案データセットが空の場合に適切に処理する", () => {
    const emptyProposalDataset: any[] = [];

    const result = prioritizeImprovementProposals(emptyProposalDataset);

    expect(result).toEqual({
      success: false,
      errorMessage: "提案データがありません",
      prioritizedProposals: [],
      isSystemHealthy: true,
      logDetails: {
        timestamp: expect.any(String),
        datasetSize: 0,
        processedCount: 0,
        errorType: "EMPTY_DATASET",
      },
    });

    expect(result.isSystemHealthy).toBe(true);
    expect(result.prioritizedProposals).toHaveLength(0);
    expect(result.logDetails.datasetSize).toBe(0);
    expect(result.logDetails.processedCount).toBe(0);
  });
});