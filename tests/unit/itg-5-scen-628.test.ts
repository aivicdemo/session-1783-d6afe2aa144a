import { aggregateFailurePatterns } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-628
  test("理由カテゴリデータ読み込み失敗時にエラーハンドリングが正しく実行される", () => {
    const rejectionRecords = [
      {
        id: "rejection_001",
        menu_id: "menu_001",
        user_id: "user_001",
        rejection_reason_text: "栄養バランスが悪い",
        reason_category_id: null,
        timestamp: "2024-01-15T12:00:00Z",
      },
      {
        id: "rejection_002",
        menu_id: "menu_002",
        user_id: "user_001",
        rejection_reason_text: "調理時間が長すぎる",
        reason_category_id: null,
        timestamp: "2024-01-15T13:00:00Z",
      },
    ];

    const reasonCategoryData = null;

    const errorLogger = jest.fn();

    expect(() => {
      aggregateFailurePatterns({
        rejectionRecords,
        reasonCategoryData,
        onError: errorLogger,
      });
    }).toThrow(/カテゴリ/);

    expect(errorLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "REASON_CATEGORY_LOAD_FAILED",
        message: expect.stringContaining("カテゴリ"),
        timestamp: expect.any(String),
      })
    );
  });
});