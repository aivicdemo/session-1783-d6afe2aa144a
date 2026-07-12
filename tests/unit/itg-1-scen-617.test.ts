import { validateAndCorrectUserData } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-617: [error] ユーザーデータの欠損値・異常値検出と補正 - 全データが欠損または異常値の場合にエラー通知される
  test("全データが欠損または異常値の場合、エラーメッセージが表示され献立生成処理が中断される", () => {
    const invalidUserData = {
      userId: null,
      age: null,
      gender: null,
      allergies: null,
      dietaryRestrictions: null,
      calorieTarget: null,
      familyMembers: null,
      mealRecords: null,
    };

    expect(() => validateAndCorrectUserData(invalidUserData)).toThrow(
      /ユーザーデータの形式が不正です/
    );
  });

  test("全データが異常値（不正な型）の場合、エラーが発動される", () => {
    const malformedUserData = {
      userId: "not-a-number",
      age: "invalid",
      gender: 999,
      allergies: { invalid: "structure" },
      dietaryRestrictions: true,
      calorieTarget: "abc",
      familyMembers: "not-array",
      mealRecords: {},
    };

    expect(() => validateAndCorrectUserData(malformedUserData)).toThrow(
      /必須項目/
    );
  });

  test("全データが空文字列またはゼロの場合、エラーが発動される", () => {
    const emptyUserData = {
      userId: "",
      age: 0,
      gender: "",
      allergies: "",
      dietaryRestrictions: "",
      calorieTarget: 0,
      familyMembers: [],
      mealRecords: [],
    };

    expect(() => validateAndCorrectUserData(emptyUserData)).toThrow(
      /入力してください/
    );
  });

  test("部分的に有効なデータがある場合、欠損値が検出され補正処理に進む", () => {
    const partialUserData = {
      userId: "user123",
      age: 35,
      gender: "male",
      allergies: null,
      dietaryRestrictions: null,
      calorieTarget: 2000,
      familyMembers: [
        {
          memberId: "fam001",
          name: "spouse",
          age: 32,
          allergies: null,
          restrictions: null,
        },
      ],
      mealRecords: [],
    };

    const result = validateAndCorrectUserData(partialUserData);

    expect(result).toHaveProperty("userId", "user123");
    expect(result).toHaveProperty("age", 35);
    expect(result).toHaveProperty("gender", "male");
    expect(result).toHaveProperty("calorieTarget", 2000);
    expect(result.allergies).toBeDefined();
    expect(result.dietaryRestrictions).toBeDefined();
    expect(Array.isArray(result.familyMembers)).toBe(true);
  });

  test("有効な全データが入力された場合、データが正常に検証され返却される", () => {
    const validUserData = {
      userId: "user456",
      age: 40,
      gender: "female",
      allergies: ["egg", "shellfish"],
      dietaryRestrictions: ["vegetarian"],
      calorieTarget: 1800,
      familyMembers: [
        {
          memberId: "fam002",
          name: "child",
          age: 8,
          allergies: ["peanut"],
          restrictions: [],
        },
      ],
      mealRecords: [
        {
          recordId: "meal001",
          date: "2024-01-15",
          meals: ["breakfast", "lunch", "dinner"],
          satisfaction: 4,
        },
      ],
    };

    const result = validateAndCorrectUserData(validUserData);

    expect(result.userId).toBe("user456");
    expect(result.age).toBe(40);
    expect(result.gender).toBe("female");
    expect(result.allergies).toEqual(["egg", "shellfish"]);
    expect(result.dietaryRestrictions).toEqual(["vegetarian"]);
    expect(result.calorieTarget).toBe(1800);
    expect(result.familyMembers.length).toBe(1);
    expect(result.mealRecords.length).toBe(1);
  });

  test("異常値を検出したログが記録される", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const invalidUserData = {
      userId: null,
      age: null,
      gender: null,
      allergies: null,
      dietaryRestrictions: null,
      calorieTarget: null,
      familyMembers: null,
      mealRecords: null,
    };

    try {
      validateAndCorrectUserData(invalidUserData);
    } catch {
      // エラーが発動することを確認
    }

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test("欠損値を補正した履歴が記録される", () => {
    const partialUserData = {
      userId: "user789",
      age: 45,
      gender: "male",
      allergies: null,
      dietaryRestrictions: null,
      calorieTarget: 2200,
      familyMembers: null,
      mealRecords: null,
    };

    const result = validateAndCorrectUserData(partialUserData);

    expect(result.correctionHistory).toBeDefined();
    expect(Array.isArray(result.correctionHistory)).toBe(true);
    expect(result.correctionHistory.length).toBeGreaterThan(0);
  });

  test("補正後のデータが献立生成処理に渡され、制約条件が正しく反映される", () => {
    const partialUserData = {
      userId: "user999",
      age: 38,
      gender: "female",
      allergies: ["dairy"],
      dietaryRestrictions: null,
      calorieTarget: 1950,
      familyMembers: [
        {
          memberId: "fam003",
          name: "toddler",
          age: 3,
          allergies: null,
          restrictions: [],
        },
      ],
      mealRecords: [],
    };

    const result = validateAndCorrectUserData(partialUserData);

    expect(result.canProceedToMealGeneration).toBe(true);
    expect(result.constraints).toBeDefined();
    expect(result.constraints.allergies).toEqual(["dairy"]);
    expect(result.constraints.calorieTarget).toBe(1950);
  });
});