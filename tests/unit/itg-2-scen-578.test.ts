import { classifyMenuFailurePattern } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立失敗パターン分類・優先度判定", () => {
  // SCEN-578
  test("未定義の失敗カテゴリが入力された場合にエラーが返される", async () => {
    const invalidInput = {
      failureCategory: "UNDEFINED_CATEGORY",
      menuId: "menu-001",
      userId: "user-001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    try {
      await classifyMenuFailurePattern(invalidInput);
      fail("エラーが発生すべきでした");
    } catch (error: any) {
      expect(error.status).toBe(422);
      expect(error.message).toMatch(/カテゴリ/);
      expect(error.details).toEqual({
        invalidField: "failureCategory",
        providedValue: "UNDEFINED_CATEGORY",
        validCategories: [
          "NUTRITION_IMBALANCE",
          "FAMILY_PREFERENCE_NOT_REFLECTED",
          "COOKING_TIME_EXCEEDED",
          "FOOD_RESTRICTION_MISSED",
        ],
      });
    }
  });

  test("有効な失敗カテゴリで正常に分類され優先度が判定される", async () => {
    const validInput = {
      failureCategory: "NUTRITION_IMBALANCE",
      menuId: "menu-001",
      userId: "user-001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
      rejectionReason: "タンパク質が不足している",
      occurrenceCount: 3,
    };

    const result = await classifyMenuFailurePattern(validInput);

    expect(result).toEqual({
      classificationId: expect.any(String),
      menuId: "menu-001",
      userId: "user-001",
      failureCategory: "NUTRITION_IMBALANCE",
      priorityScore: 8,
      riskLevel: "HIGH",
      recommendedAction: "栄養基準ロジックを改善し、タンパク質含有量を増加させる",
      affectedNutrients: ["protein"],
      estimatedImpact: 0.25,
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });
  });

  test("複数回発生した失敗パターンはより高い優先度が付与される", async () => {
    const frequentFailureInput = {
      failureCategory: "FAMILY_PREFERENCE_NOT_REFLECTED",
      menuId: "menu-002",
      userId: "user-001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
      rejectionReason: "家族が好まない食材が含まれていた",
      occurrenceCount: 7,
    };

    const result = await classifyMenuFailurePattern(frequentFailureInput);

    expect(result.priorityScore).toBe(9);
    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.estimatedImpact).toBe(0.35);
  });

  test("調理時間超過カテゴリで適切な優先度が計算される", async () => {
    const cookingTimeInput = {
      failureCategory: "COOKING_TIME_EXCEEDED",
      menuId: "menu-003",
      userId: "user-002",
      timestamp: new Date("2024-01-15T11:00:00Z"),
      rejectionReason: "予定時間を30分超過した",
      occurrenceCount: 2,
    };

    const result = await classifyMenuFailurePattern(cookingTimeInput);

    expect(result.failureCategory).toBe("COOKING_TIME_EXCEEDED");
    expect(result.priorityScore).toBe(6);
    expect(result.riskLevel).toBe("MEDIUM");
    expect(result.recommendedAction).toMatch(/調理時間/);
  });

  test("食材制限漏れカテゴリで即時対応が必要な優先度が付与される", async () => {
    const restrictionMissedInput = {
      failureCategory: "FOOD_RESTRICTION_MISSED",
      menuId: "menu-004",
      userId: "user-003",
      timestamp: new Date("2024-01-15T11:00:00Z"),
      rejectionReason: "アレルギー対象食材が含まれていた",
      occurrenceCount: 5,
    };

    const result = await classifyMenuFailurePattern(restrictionMissedInput);

    expect(result.failureCategory).toBe("FOOD_RESTRICTION_MISSED");
    expect(result.priorityScore).toBe(10);
    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.recommendedAction).toMatch(/制限/);
  });

  test("invalid_type という形式の無効なカテゴリでもエラーが返される", async () => {
    const malformedInput = {
      failureCategory: "invalid_type",
      menuId: "menu-005",
      userId: "user-001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    try {
      await classifyMenuFailurePattern(malformedInput);
      fail("エラーが発生すべきでした");
    } catch (error: any) {
      expect(error.status).toBe(422);
      expect(error.message).toMatch(/カテゴリ/);
    }
  });

  test("カテゴリが空文字列の場合はエラーが返される", async () => {
    const emptyInput = {
      failureCategory: "",
      menuId: "menu-006",
      userId: "user-001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    try {
      await classifyMenuFailurePattern(emptyInput);
      fail("エラーが発生すべきでした");
    } catch (error: any) {
      expect(error.status).toBe(422);
      expect(error.message).toMatch(/カテゴリ/);
    }
  });

  test("大文字小文字を区別して無効なカテゴリを検出する", async () => {
    const lowercaseInput = {
      failureCategory: "nutrition_imbalance",
      menuId: "menu-007",
      userId: "user-001",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    };

    try {
      await classifyMenuFailurePattern(lowercaseInput);
      fail("エラーが発生すべきでした");
    } catch (error: any) {
      expect(error.status).toBe(422);
      expect(error.message).toMatch(/カテゴリ/);
    }
  });
});