import { detectConflictingMenus } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データ自動集計・達成度可視化ダッシュボード", () => {
  test("SCEN-322: 献立履歴が空の場合、抵触献立一覧は空リストで返される", () => {
    // 前提: 栄養管理・分析ダッシュボードシステムにログイン済みで、献立履歴が空の状態
    const userId = "user-001";
    const familyMembers = [
      {
        memberId: "member-001",
        name: "child",
        age: 8,
        allergies: ["peanut"],
        dietaryRestrictions: ["low-sodium"],
      },
    ];
    const newDietaryRestriction = {
      memberId: "member-001",
      restrictionType: "gluten-free",
      appliedDate: new Date("2024-01-15T10:00:00Z"),
    };
    const menuHistory = []; // 献立履歴が空

    // 発生条件: 共働き配偶者が新しい食事制限条件をアプリに入力・送信したとき

    // 結果: 過去献立との抵触パターンを自動検出し、制限に違反する献立を一覧表示
    const result = detectConflictingMenus({
      userId,
      familyMembers,
      newDietaryRestriction,
      menuHistory,
    });

    // 期待値: 抵触献立一覧が空配列で返却され、エラーが発生せず正常に処理が完了
    expect(result).toEqual({
      conflictingMenus: [],
      totalConflictCount: 0,
      processedAt: expect.any(String),
      status: "success",
    });

    // 追加検証: 返却されるリストが正確に空配列であることを確認
    expect(Array.isArray(result.conflictingMenus)).toBe(true);
    expect(result.conflictingMenus.length).toBe(0);
    expect(result.totalConflictCount).toBe(0);
    expect(result.status).toBe("success");
  });
});