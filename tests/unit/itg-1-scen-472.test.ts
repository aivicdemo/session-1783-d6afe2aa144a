import { detectConflictingMenus } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出", () => {
  // SCEN-472
  test("不正なフォーマットの制限条件が入力された場合、ValidationErrorを発生させる", () => {
    const pastMenuHistory = [
      {
        menuId: "menu_001",
        date: "2024-01-15",
        dishes: [
          {
            dishId: "dish_001",
            name: "鶏唐揚げ",
            ingredients: ["鶏肉", "小麦粉", "塩"],
          },
        ],
      },
    ];

    const invalidRestrictions = [
      "!!!***@@@", // 特殊文字のみ
      "123@456#789", // 数値と記号の混在
      "<script>alert('test')</script>", // スクリプトタグ
      "||||||", // 重複する記号
    ];

    invalidRestrictions.forEach((restriction) => {
      expect(() =>
        detectConflictingMenus({
          pastMenus: pastMenuHistory,
          newRestriction: restriction,
          userId: "user_001",
        })
      ).toThrow(/入力形式/);
    });
  });
});