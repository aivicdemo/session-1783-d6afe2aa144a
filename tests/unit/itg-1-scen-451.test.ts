import { validateMealEvaluationInputDeadline } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("食事評価入力期限管理機能", () => {
  // SCEN-451: [normal] 入力期限超過後の未入力評価が次週献立生成から除外される
  test("入力期限を超過した未入力の食事評価は次週献立生成アルゴリズムの学習データから除外され、期限内に入力された評価のみが次週献立生成に反映される", () => {
    // 対象週の献立が生成されている状態
    const targetWeekMenuId = "menu-2024-w01";
    const targetWeekStartDate = new Date("2024-01-08T00:00:00Z");
    const targetWeekEndDate = new Date("2024-01-14T23:59:59Z");

    // 対象週の食事評価入力期限を確認
    const evaluationDeadlineDate = new Date("2024-01-16T23:59:59Z"); // 献立実行完了から24時間後
    const currentTimeBeforeDeadline = new Date("2024-01-16T12:00:00Z"); // 期限内

    // 対象週の献立に含まれる食事
    const mealRecords = [
      {
        mealId: "meal-001",
        menuId: targetWeekMenuId,
        dishName: "唐揚げ定食",
        servingDate: new Date("2024-01-08T18:00:00Z"),
      },
      {
        mealId: "meal-002",
        menuId: targetWeekMenuId,
        dishName: "野菜炒め",
        servingDate: new Date("2024-01-09T18:00:00Z"),
      },
      {
        mealId: "meal-003",
        menuId: targetWeekMenuId,
        dishName: "煮込みハンバーグ",
        servingDate: new Date("2024-01-10T18:00:00Z"),
      },
    ];

    // 期限内に入力された評価
    const evaluationsWithinDeadline = [
      {
        mealId: "meal-001",
        satisfactionScore: 5,
        completionRate: 100,
        familyMemberId: "member-001",
        submittedAt: new Date("2024-01-16T10:00:00Z"),
      },
      {
        mealId: "meal-002",
        satisfactionScore: 4,
        completionRate: 85,
        familyMemberId: "member-002",
        submittedAt: new Date("2024-01-16T14:00:00Z"),
      },
    ];

    // meal-003 は期限内に評価が提出されていない（未入力）

    // 時刻を期限超過に進める
    const currentTimeAfterDeadline = new Date("2024-01-17T10:00:00Z"); // 期限超過

    // 期限内に提出された評価の数
    const evaluationsSubmittedBeforeDeadline = evaluationsWithinDeadline.filter(
      (eval) => eval.submittedAt < evaluationDeadlineDate
    ).length;

    // 未入力の食事（期限内に評価が提出されなかった食事）
    const mealIdsWithEvaluations = evaluationsWithinDeadline.map(
      (e) => e.mealId
    );
    const mealIdsWithoutEvaluations = mealRecords
      .map((m) => m.mealId)
      .filter((id) => !mealIdsWithEvaluations.includes(id));

    // テスト対象関数を呼び出し
    const result = validateMealEvaluationInputDeadline({
      targetWeekMenuId,
      targetWeekStartDate,
      targetWeekEndDate,
      evaluationDeadlineDate,
      currentTime: currentTimeAfterDeadline,
      mealRecords,
      evaluationsWithinDeadline,
    });

    // 期限内に提出された評価は2件
    expect(evaluationsSubmittedBeforeDeadline).toBe(2);

    // 未入力の食事は meal-003 の1件
    expect(mealIdsWithoutEvaluations).toEqual(["meal-003"]);

    // 次週献立生成アルゴリズムの学習データから除外される食事のID
    expect(result.mealsToExcludeFromNextWeekGeneration).toEqual(["meal-003"]);

    // 次週献立生成に反映される食事のID
    expect(result.mealsToIncludeInNextWeekGeneration).toEqual([
      "meal-001",
      "meal-002",
    ]);

    // 期限超過状態であることを確認
    expect(result.isDeadlineExceeded).toBe(true);

    // 除外された食事の数
    expect(result.excludedMealCount).toBe(1);

    // 反映された食事の数
    expect(result.includedMealCount).toBe(2);

    // 期限内に提出された評価データのみが学習データに含まれる
    expect(result.learningDataForNextWeekGeneration).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mealId: "meal-001",
          satisfactionScore: 5,
          completionRate: 100,
        }),
        expect.objectContaining({
          mealId: "meal-002",
          satisfactionScore: 4,
          completionRate: 85,
        }),
      ])
    );

    // 期限超過の未入力評価は学習データから完全に除外される
    expect(result.learningDataForNextWeekGeneration).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mealId: "meal-003",
        }),
      ])
    );
  });
});