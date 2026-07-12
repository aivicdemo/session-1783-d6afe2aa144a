import { classifyMealRejectionReason } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-607
  test("献立却下修正理由の自動分類 - 献立却下・修正理由が栄養バランス不適切・家族好み未反映・調理時間超過・食材制限漏れのカテゴリに正常に分類される", () => {
    // 栄養バランス不適切に関するテストケース
    const nutritionBalanceReasons = [
      "タンパク質が足りない献立だった",
      "野菜がほとんど含まれていない",
      "塩分が多すぎる組み合わせ",
      "栄養バランスが悪い"
    ];

    nutritionBalanceReasons.forEach((reason) => {
      const result = classifyMealRejectionReason(reason);
      expect(result).toEqual({
        category: "栄養バランス不適切",
        confidence: expect.any(Number),
        originalText: reason
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    // 家族好み未反映に関するテストケース
    const familyPreferenceReasons = [
      "子どもが嫌いなトマトが入っていた",
      "夫が苦手な食材が含まれている",
      "家族の好みが反映されていない",
      "みんなが好きな料理がない"
    ];

    familyPreferenceReasons.forEach((reason) => {
      const result = classifyMealRejectionReason(reason);
      expect(result).toEqual({
        category: "家族好み未反映",
        confidence: expect.any(Number),
        originalText: reason
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    // 調理時間超過に関するテストケース
    const cookingTimeReasons = [
      "調理に2時間もかかる",
      "仕事から帰ってきてから作るには時間がない",
      "手間がかかりすぎて現実的でない",
      "調理時間が長すぎる"
    ];

    cookingTimeReasons.forEach((reason) => {
      const result = classifyMealRejectionReason(reason);
      expect(result).toEqual({
        category: "調理時間超過",
        confidence: expect.any(Number),
        originalText: reason
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    // 食材制限漏れに関するテストケース
    const ingredientRestrictionReasons = [
      "息子のピーナッツアレルギーが考慮されていない",
      "妻が制限している小麦粉が入っている",
      "食材制限を無視している",
      "アレルギーのある食材が含まれている"
    ];

    ingredientRestrictionReasons.forEach((reason) => {
      const result = classifyMealRejectionReason(reason);
      expect(result).toEqual({
        category: "食材制限漏れ",
        confidence: expect.any(Number),
        originalText: reason
      });
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    // 複数の理由が混在するテストケース（主要カテゴリで分類）
    const mixedReasons = [
      {
        text: "調理時間が長くて栄養バランスも悪い",
        expectedCategory: "調理時間超過" // または "栄養バランス不適切"
      },
      {
        text: "家族の好みに合わず、アレルギー食材も入っている",
        expectedCategory: "家族好み未反映" // または "食材制限漏れ"
      },
      {
        text: "タンパク質不足で、かつ調理に時間がかかる",
        expectedCategory: "栄養バランス不適切" // または "調理時間超過"
      }
    ];

    mixedReasons.forEach(({ text, expectedCategory }) => {
      const result = classifyMealRejectionReason(text);
      expect(result.category).toMatch(
        /栄養バランス不適切|家族好み未反映|調理時間超過|食材制限漏れ/
      );
      expect(result.originalText).toBe(text);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    // 全カテゴリの分類精度検証
    const allTestReasons = [
      ...nutritionBalanceReasons.map((r) => ({
        text: r,
        expected: "栄養バランス不適切"
      })),
      ...familyPreferenceReasons.map((r) => ({
        text: r,
        expected: "家族好み未反映"
      })),
      ...cookingTimeReasons.map((r) => ({
        text: r,
        expected: "調理時間超過"
      })),
      ...ingredientRestrictionReasons.map((r) => ({
        text: r,
        expected: "食材制限漏れ"
      }))
    ];

    const classificationResults = allTestReasons.map(({ text, expected }) => ({
      text,
      expected,
      result: classifyMealRejectionReason(text)
    }));

    // 分類精度を検証
    const correctClassifications = classificationResults.filter(
      (item) => item.result.category === item.expected
    ).length;

    const classificationAccuracy =
      (correctClassifications / classificationResults.length) * 100;

    expect(classificationAccuracy).toBeGreaterThanOrEqual(100);

    // 各結果の構造を検証
    classificationResults.forEach(({ result }) => {
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("originalText");
      expect(typeof result.confidence).toBe("number");
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});