import { detectMealRestrictionConflicts } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-653
  test("食事制限条件変更の抵触検出機能 - 過去献立データが不完全な場合でもシステムが例外なく処理される", () => {
    // Arrange: 不完全な過去献立データ（必須フィールドが欠落）を3件以上用意
    const incompleteMealHistories = [
      {
        mealId: 1,
        mealName: "料理A",
        ingredients: ["鶏肉", "塩"],
        // nutritionData 欠落
      },
      {
        mealId: 2,
        mealName: "料理B",
        // ingredients 欠落
        nutritionData: { protein: 20, carbs: 50 },
      },
      {
        mealId: 3,
        // mealName 欠落
        ingredients: ["卵", "砂糖"],
        nutritionData: { protein: 15, carbs: 40 },
      },
      {
        mealId: 4,
        mealName: "料理D",
        ingredients: ["豚肉", "醤油"],
        nutritionData: { protein: 25, carbs: 45, allergens: ["豚肉"] },
      },
    ];

    // 新しい食事制限条件を設定（例：アレルギー情報、栄養成分制限）
    const newRestrictionCondition = {
      restrictionType: "allergen",
      allergenName: "豚肉",
      severity: "critical",
      appliedDate: new Date("2024-01-15T10:00:00Z"),
    };

    // Act: 抵触検出機能を呼び出す
    const result = detectMealRestrictionConflicts({
      pastMealHistories: incompleteMealHistories as any,
      restrictionCondition: newRestrictionCondition,
    });

    // Assert: システムが例外を発生させずに処理完了
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    // 戻り値が正常なレスポンスフォーマットであることを検証
    expect(result).toHaveProperty("conflictedMeals");
    expect(result).toHaveProperty("validMealsProcessed");
    expect(result).toHaveProperty("invalidMealsExcluded");
    expect(result).toHaveProperty("processingStatus");

    // 不完全なデータを除外した上で、有効なデータのみに基づいて抵触判定結果が返されていることを確認
    expect(Array.isArray(result.conflictedMeals)).toBe(true);
    expect(Array.isArray(result.validMealsProcessed)).toBe(true);
    expect(Array.isArray(result.invalidMealsExcluded)).toBe(true);

    // 有効なデータは mealId 4 のみ（豚肉を含む）
    expect(result.validMealsProcessed.length).toBe(1);
    expect(result.validMealsProcessed[0].mealId).toBe(4);

    // 不完全なデータ（mealId 1, 2, 3）が除外されていることを確認
    expect(result.invalidMealsExcluded.length).toBe(3);
    const excludedIds = result.invalidMealsExcluded.map(
      (meal: any) => meal.mealId
    );
    expect(excludedIds).toContain(1);
    expect(excludedIds).toContain(2);
    expect(excludedIds).toContain(3);

    // 豚肉アレルギー制限に抵触するのは mealId 4
    expect(result.conflictedMeals.length).toBe(1);
    expect(result.conflictedMeals[0].mealId).toBe(4);
    expect(result.conflictedMeals[0].conflictReason).toContain("豚肉");

    // 処理ステータスが成功であることを確認
    expect(result.processingStatus).toBe("success");

    // エラーが記録されていないことを確認
    expect(result).not.toHaveProperty("errorLog");
  });
});