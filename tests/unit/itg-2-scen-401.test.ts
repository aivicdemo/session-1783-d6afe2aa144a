import { validateDietaryRestrictionInput } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データ自動集計ダッシュボード", () => {
  // SCEN-401: [error] 食事制限条件入力検証機能 - 入力値が null または空文字列の場合、バリデーションエラーで送信を拒否する
  test("食事制限条件が null または空文字列のとき、送信を拒否してバリデーションエラーを返す", () => {
    // null の場合
    expect(() => validateDietaryRestrictionInput({ restrictionName: null })).toThrow(/食事制限条件/);

    // 空文字列の場合
    expect(() => validateDietaryRestrictionInput({ restrictionName: "" })).toThrow(/食事制限条件/);

    // 正常な入力値の場合は送信が受け付けられる
    const validInput = { restrictionName: "グルテンフリー" };
    const result = validateDietaryRestrictionInput(validInput);
    expect(result).toEqual({
      isValid: true,
      restrictionName: "グルテンフリー",
    });
  });
});