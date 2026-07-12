import { classifyUserSegment } from "../../src/logic/it-1-1-1";

describe("ユーザーセグメント分類エラーハンドリング", () => {
  test("SCEN-396: 複数条件で合致しないセグメント分類時のエラー発生と処理確認", () => {
    // 年代・家族構成・食材制限有無の複数条件が合致しない入力データ
    const invalid_segment_input = {
      age_group: "30s",
      family_structure: "single",
      food_restriction_type: "egg_allergy",
      user_id: "test_user_999",
    };

    // システムに存在しない組み合わせのため、エラーが発生することを確認
    expect(() => classifyUserSegment(invalid_segment_input)).toThrow(
      /セグメント条件/
    );
  });
});