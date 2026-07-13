import { recordDietaryRestrictionAuditLog } from "../../src/logic/it-1-br-2-1-1-1";

describe("食事制限条件変更監査ログ記録機能", () => {
  // SCEN-419: [error] 食事制限条件変更監査ログ記録機能 - 変更者情報が欠落している場合、記録処理がエラーで中断される
  test("変更者情報が欠落しているとき、監査ログ記録処理がエラーで中断される", () => {
    const dietaryRestrictionChangeData = {
      restrictionId: "dr_001",
      previousCalorieLimit: 1800,
      newCalorieLimit: 2000,
      previousRestrictedIngredients: ["egg", "peanut"],
      newRestrictedIngredients: ["egg", "peanut", "shellfish"],
      changeTimestamp: new Date("2024-01-15T11:30:00Z"),
      changedByUserId: null,
      changedByUserName: null,
    };

    expect(() =>
      recordDietaryRestrictionAuditLog(dietaryRestrictionChangeData)
    ).toThrow(/変更者情報/);
  });

  test("変更者情報が完全に入力されているとき、監査ログが正常に記録される", () => {
    const dietaryRestrictionChangeData = {
      restrictionId: "dr_001",
      previousCalorieLimit: 1800,
      newCalorieLimit: 2000,
      previousRestrictedIngredients: ["egg", "peanut"],
      newRestrictedIngredients: ["egg", "peanut", "shellfish"],
      changeTimestamp: new Date("2024-01-15T11:30:00Z"),
      changedByUserId: "user_spouse_001",
      changedByUserName: "田中花子",
    };

    const result = recordDietaryRestrictionAuditLog(
      dietaryRestrictionChangeData
    );

    expect(result).toEqual({
      auditLogId: expect.any(String),
      restrictionId: "dr_001",
      changeType: "RESTRICTION_CONDITION_UPDATE",
      previousValues: {
        calorieLimit: 1800,
        restrictedIngredients: ["egg", "peanut"],
      },
      newValues: {
        calorieLimit: 2000,
        restrictedIngredients: ["egg", "peanut", "shellfish"],
      },
      changedByUserId: "user_spouse_001",
      changedByUserName: "田中花子",
      changeTimestamp: new Date("2024-01-15T11:30:00Z"),
      recordedAt: expect.any(Date),
      status: "RECORDED",
    });
  });

  test("変更者ユーザーIDが欠落しているとき、記録処理がエラーで中断される", () => {
    const dietaryRestrictionChangeData = {
      restrictionId: "dr_002",
      previousCalorieLimit: 1600,
      newCalorieLimit: 1800,
      previousRestrictedIngredients: ["milk"],
      newRestrictedIngredients: ["milk", "gluten"],
      changeTimestamp: new Date("2024-01-15T12:00:00Z"),
      changedByUserId: null,
      changedByUserName: "田中太郎",
    };

    expect(() =>
      recordDietaryRestrictionAuditLog(dietaryRestrictionChangeData)
    ).toThrow(/変更者情報/);
  });

  test("変更者ユーザー名が欠落しているとき、記録処理がエラーで中断される", () => {
    const dietaryRestrictionChangeData = {
      restrictionId: "dr_003",
      previousCalorieLimit: 2000,
      newCalorieLimit: 2200,
      previousRestrictedIngredients: ["soy"],
      newRestrictedIngredients: ["soy", "sesame"],
      changeTimestamp: new Date("2024-01-15T13:15:00Z"),
      changedByUserId: "user_spouse_002",
      changedByUserName: null,
    };

    expect(() =>
      recordDietaryRestrictionAuditLog(dietaryRestrictionChangeData)
    ).toThrow(/変更者情報/);
  });

  test("変更内容が記録される際、変更の詳細（前後の値、タイムスタンプ、変更者）がすべて監査ログに含まれる", () => {
    const dietaryRestrictionChangeData = {
      restrictionId: "dr_004",
      previousCalorieLimit: 2100,
      newCalorieLimit: 2300,
      previousRestrictedIngredients: ["wheat"],
      newRestrictedIngredients: ["wheat", "buckwheat", "corn"],
      changeTimestamp: new Date("2024-01-15T14:45:00Z"),
      changedByUserId: "user_spouse_003",
      changedByUserName: "佐藤美咲",
    };

    const result = recordDietaryRestrictionAuditLog(
      dietaryRestrictionChangeData
    );

    expect(result.previousValues.calorieLimit).toBe(2100);
    expect(result.newValues.calorieLimit).toBe(2300);
    expect(result.previousValues.restrictedIngredients).toEqual(["wheat"]);
    expect(result.newValues.restrictedIngredients).toEqual([
      "wheat",
      "buckwheat",
      "corn",
    ]);
    expect(result.changedByUserId).toBe("user_spouse_003");
    expect(result.changedByUserName).toBe("佐藤美咲");
    expect(result.changeTimestamp).toEqual(
      new Date("2024-01-15T14:45:00Z")
    );
    expect(result.status).toBe("RECORDED");
  });
});