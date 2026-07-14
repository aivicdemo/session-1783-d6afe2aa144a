import { classifyRejectModifyReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン特定", () => {
  // SCEN-674: [edge] 却下修正理由自動カテゴリ分類機能 - 空文字列や null 値の理由データが入力された場合、エラーを返す
  test("should throw validation error when reason is empty string, null, or undefined", () => {
    // Test with empty string
    expect(() => classifyRejectModifyReason("")).toThrow(/入力値の検証/);

    // Test with null
    expect(() => classifyRejectModifyReason(null as any)).toThrow(
      /入力値の検証/
    );

    // Test with undefined
    expect(() => classifyRejectModifyReason(undefined as any)).toThrow(
      /入力値の検証/
    );
  });
});