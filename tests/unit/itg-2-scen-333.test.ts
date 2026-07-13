import { validateMenuConfirmationConstraints } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立確定時の全制約条件検証・確定可否判定機能", () => {
  // SCEN-333
  test("制約条件データが破損または不完全な場合、エラーメッセージが返される", () => {
    // 破損した制約条件データ：必須フィールドがNULL
    const corruptedConstraints = {
      nutritionId: "nutr_001",
      nutritionName: null, // 破損：必須フィールドがNULL
      targetValue: 2000,
      actualValue: 1800,
      achievementRate: 90,
    };

    const incompleteConstraints = {
      allergyId: "allergy_001",
      allergyName: "卵",
      // 破損：必須フィールド allergyStatus が存在しない
    };

    const nullConstraints = {
      budgetId: null, // 破損：主キーがNULL
      budgetLimit: 5000,
      actualCost: 4500,
    };

    // 制約条件データが破損している場合のテスト
    expect(() =>
      validateMenuConfirmationConstraints([corruptedConstraints])
    ).toThrow(/制約条件データが不完全です/);

    // 必須フィールドが不足している場合のテスト
    expect(() =>
      validateMenuConfirmationConstraints([incompleteConstraints])
    ).toThrow(/制約条件データが不完全です/);

    // 主キーがNULLの場合のテスト
    expect(() =>
      validateMenuConfirmationConstraints([nullConstraints])
    ).toThrow(/制約条件データが不完全です/);

    // 複数の制約条件の中に破損データがある場合のテスト
    const mixedConstraints = [
      {
        nutritionId: "nutr_002",
        nutritionName: "タンパク質",
        targetValue: 100,
        actualValue: 95,
        achievementRate: 95,
      },
      corruptedConstraints, // 破損したデータ
      {
        allergyId: "allergy_002",
        allergyName: "乳製品",
        allergyStatus: "active",
      },
    ];

    expect(() =>
      validateMenuConfirmationConstraints(mixedConstraints)
    ).toThrow(/制約条件データが不完全です/);
  });
});