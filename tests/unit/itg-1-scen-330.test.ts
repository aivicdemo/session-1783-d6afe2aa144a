import { validateMealGenerationConstraints } from "../../src/logic/it-1-1-1";

describe("家族成員の食事評価履歴とアレルギー・食事制限情報の変更を定期的に監視し、献立生成アルゴリズムの制約条件に自動反映する機能", () => {
  // SCEN-330
  test("[error] 献立生成要求処理 - 未登録の食事制限・アレルギー情報がある場合、献立生成要求が拒否されエラーが返される", () => {
    const registeredRestrictions = ["低塩分", "低糖質"];
    const registeredAllergens = ["卵", "牛乳", "小麦"];

    const mealGenerationRequest = {
      userId: "user123",
      familyMemberId: "member456",
      restrictionNames: ["低塩分", "カスタム制限A"],
      allergenNames: ["卵", "未知のアレルゲンX"],
      targetDate: "2024-01-15",
    };

    expect(() =>
      validateMealGenerationConstraints(
        mealGenerationRequest,
        registeredRestrictions,
        registeredAllergens
      )
    ).toThrow(/登録されていない食事制限またはアレルギー情報/);
  });
});