import { classifyMenuRejectionReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類", () => {
  // SCEN-884
  test("事前定義されていない理由が入力された場合に未分類カテゴリで処理される", () => {
    const undefinedReasonText = "システムで定義されていない新しい理由";
    
    const result = classifyMenuRejectionReason({
      reasonText: undefinedReasonText,
      userId: "user_001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    expect(result).toEqual({
      category: "その他",
      confidence: 0,
      originalText: undefinedReasonText,
      isClassified: false,
      logMessage: expect.stringContaining("分類不可"),
    });

    expect(result.category).toBe("その他");
    expect(result.isClassified).toBe(false);
    expect(result.confidence).toBe(0);
  });
});