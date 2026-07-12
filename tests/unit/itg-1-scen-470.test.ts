import { detectConflictingMeals } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出", () => {
  // SCEN-470
  test("新規食事制限条件が過去献立と一切抵触しない場合、抵触リストが空配列で返却される", () => {
    // 過去献立として、卵・乳製品を含む献立3件を事前登録
    const pastMeals = [
      {
        mealId: "meal-001",
        mealName: "卵焼きとご飯",
        ingredients: ["卵", "米", "醤油"],
        allergens: ["卵"],
      },
      {
        mealId: "meal-002",
        mealName: "チーズピザ",
        ingredients: ["小麦粉", "チーズ", "トマト"],
        allergens: ["乳製品"],
      },
      {
        mealId: "meal-003",
        mealName: "牛乳プリン",
        ingredients: ["牛乳", "砂糖", "卵"],
        allergens: ["卵", "乳製品"],
      },
    ];

    // 現在の食事制限条件（卵・乳製品アレルギー）を確認
    const currentRestrictions = {
      allergens: ["卵", "乳製品"],
      dietaryRestrictions: [],
    };

    // 新規食事制限条件として「ピーナッツアレルギー」を追加
    const newRestriction = {
      type: "allergen",
      value: "ピーナッツ",
    };

    // 過去献立との抵触検出処理を実行
    const conflictList = detectConflictingMeals({
      pastMeals,
      currentRestrictions,
      newRestriction,
    });

    // 期待結果：抵触リストが空配列で返却される
    // 新規制限「ピーナッツアレルギー」は過去献立のいずれにも含まれていない
    expect(conflictList).toEqual([]);
  });
});