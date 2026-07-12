import { calculateNutritionStandardsByAge } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-521: [error] 栄養摂取状況可視化機能 - 家族成員の年齢・性別情報が欠落している場合、栄養基準値の決定がエラーを返す
  test("年齢または性別情報が欠落している家族成員に対して、栄養基準値の決定処理がエラーを返す", () => {
    // 年齢が null の家族成員データ
    const familyMemberWithoutAge = {
      family_member_id: "fm_001",
      name: "太郎",
      age: null,
      gender: "M",
    };

    // 性別が null の家族成員データ
    const familyMemberWithoutGender = {
      family_member_id: "fm_002",
      name: "花子",
      age: 8,
      gender: null,
    };

    // 年齢と性別が両方欠落している家族成員データ
    const familyMemberWithoutBoth = {
      family_member_id: "fm_003",
      name: "次郎",
      age: null,
      gender: null,
    };

    // 年齢欠落時のエラー検証
    expect(() =>
      calculateNutritionStandardsByAge(familyMemberWithoutAge)
    ).toThrow(/年齢/);

    // 性別欠落時のエラー検証
    expect(() =>
      calculateNutritionStandardsByAge(familyMemberWithoutGender)
    ).toThrow(/性別/);

    // 両方欠落時のエラー検証
    expect(() =>
      calculateNutritionStandardsByAge(familyMemberWithoutBoth)
    ).toThrow(/年齢|性別/);

    // 正常な家族成員データで成功ケース：年齢10歳、男性
    const validFamilyMember = {
      family_member_id: "fm_004",
      name: "三郎",
      age: 10,
      gender: "M",
    };

    const result = calculateNutritionStandardsByAge(validFamilyMember);

    // 計算結果が正常に返されることを確認
    expect(result).toBeDefined();
    expect(result).toHaveProperty("calorie");
    expect(result).toHaveProperty("protein");
    expect(result).toHaveProperty("fat");
    expect(result).toHaveProperty("carbohydrate");

    // 年齢10歳男性の栄養基準値は想定範囲内であることを確認
    // 例：10歳男性の推定必要カロリーは約2000kcal
    expect(result.calorie).toBeGreaterThan(1800);
    expect(result.calorie).toBeLessThan(2200);

    // タンパク質の基準値（年齢10歳：約50g程度）
    expect(result.protein).toBeGreaterThan(40);
    expect(result.protein).toBeLessThan(60);
  });
});