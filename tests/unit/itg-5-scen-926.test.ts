import { defineSegmentClassificationCriteria } from "../../src/logic/it-7-2-1";

describe("ユーザーセグメント分類基準定義機能", () => {
  // SCEN-926: [edge] 年代の分類範囲が重複する場合に検出されエラーが発生する
  test("年代分類範囲の重複検出とエラーメッセージ表示", () => {
    const ageRanges = [
      { minAge: 20, maxAge: 40, label: "20代～40代" },
      { minAge: 35, maxAge: 55, label: "35歳～55歳" }
    ];

    const familyCompositionTypes = ["couple", "threeGeneration"];
    const dietaryRestrictionHasTypes = [true, false];

    const result = defineSegmentClassificationCriteria({
      ageRanges,
      familyCompositionTypes,
      dietaryRestrictionHasTypes
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/分類範囲が重複/);
    expect(result.errorMessage).toMatch(/年代範囲/);
  });
});