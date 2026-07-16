import {
  extractSegmentUtilizationPatterns,
} from "../../src/logic/it-1-br-8-2-1-1";

describe("ユーザーセグメント別利用パターン分析ダッシュボード", () => {
  // SCEN-339
  test("専業主夫層のセグメント別に食材制限・調理時間制限・予算制約の利用パターンが正しく抽出される", () => {
    const segmentCriteria = {
      gender: "male",
      occupation: "househusband",
      ageRangeMin: 30,
      ageRangeMax: 59,
    };

    const userData = [
      {
        userId: "user_001",
        gender: "male",
        occupation: "househusband",
        age: 35,
        dietaryRestrictions: ["peanut_allergy", "shellfish_allergy"],
        cookingTimeMinutes: 15,
        dailyBudgetYen: 500,
      },
      {
        userId: "user_002",
        gender: "male",
        occupation: "househusband",
        age: 42,
        dietaryRestrictions: ["peanut_allergy"],
        cookingTimeMinutes: 30,
        dailyBudgetYen: 500,
      },
      {
        userId: "user_003",
        gender: "male",
        occupation: "househusband",
        age: 38,
        dietaryRestrictions: ["shellfish_allergy", "egg_allergy"],
        cookingTimeMinutes: 60,
        dailyBudgetYen: 500,
      },
      {
        userId: "user_004",
        gender: "male",
        occupation: "househusband",
        age: 45,
        dietaryRestrictions: ["peanut_allergy", "shellfish_allergy", "egg_allergy"],
        cookingTimeMinutes: 15,
        dailyBudgetYen: 1000,
      },
      {
        userId: "user_005",
        gender: "male",
        occupation: "househusband",
        age: 50,
        dietaryRestrictions: ["shellfish_allergy"],
        cookingTimeMinutes: 30,
        dailyBudgetYen: 1000,
      },
      {
        userId: "user_006",
        gender: "male",
        occupation: "househusband",
        age: 33,
        dietaryRestrictions: ["gluten_free"],
        cookingTimeMinutes: 60,
        dailyBudgetYen: 1000,
      },
      {
        userId: "user_007",
        gender: "male",
        occupation: "househusband",
        age: 48,
        dietaryRestrictions: ["peanut_allergy", "egg_allergy"],
        cookingTimeMinutes: 15,
        dailyBudgetYen: 500,
      },
      {
        userId: "user_008",
        gender: "male",
        occupation: "househusband",
        age: 41,
        dietaryRestrictions: ["shellfish_allergy", "gluten_free"],
        cookingTimeMinutes: 30,
        dailyBudgetYen: 500,
      },
      {
        userId: "user_009",
        gender: "male",
        occupation: "househusband",
        age: 36,
        dietaryRestrictions: ["egg_allergy"],
        cookingTimeMinutes: 60,
        dailyBudgetYen: 1000,
      },
      {
        userId: "user_010",
        gender: "male",
        occupation: "househusband",
        age: 52,
        dietaryRestrictions: ["peanut_allergy", "shellfish_allergy"],
        cookingTimeMinutes: 15,
        dailyBudgetYen: 1000,
      },
      {
        userId: "user_011",
        gender: "male",
        occupation: "househusband",
        age: 39,
        dietaryRestrictions: ["gluten_free", "egg_allergy"],
        cookingTimeMinutes: 30,
        dailyBudgetYen: 500,
      },
    ];

    const result = extractSegmentUtilizationPatterns(segmentCriteria, userData);

    // 期待値の計算：
    // セグメント対象ユーザー数: 11名 (全員が男性、専業主夫、30-59歳を満たす)

    // 食材制限別の利用パターン件数
    // peanut_allergy: user_001, user_002, user_004, user_007, user_010, user_011 = 6件
    // shellfish_allergy: user_001, user_003, user_004, user_005, user_008, user_010 = 6件
    // egg_allergy: user_003, user_004, user_007, user_009, user_011 = 5件
    // gluten_free: user_006, user_008, user_011 = 3件

    // 調理時間制限別の利用パターン件数
    // 15分以内: user_001, user_004, user_007, user_010 = 4件
    // 30分以内: user_002, user_005, user_008, user_011 = 4件
    // 60分以内: user_003, user_006, user_009 = 3件

    // 予算制約別の利用パターン件数
    // 500円以下: user_001, user_002, user_003, user_007, user_008, user_011 = 6件
    // 1000円以下: user_004, user_005, user_006, user_009, user_010 = 5件

    expect(result.segmentUserCount).toBe(11);

    expect(result.dietaryRestrictionPatterns.length).toBeGreaterThanOrEqual(4);
    const peanutPattern = result.dietaryRestrictionPatterns.find(
      (p: any) => p.restrictionType === "peanut_allergy"
    );
    expect(peanutPattern?.count).toBe(6);

    const shellfishPattern = result.dietaryRestrictionPatterns.find(
      (p: any) => p.restrictionType === "shellfish_allergy"
    );
    expect(shellfishPattern?.count).toBe(6);

    const eggPattern = result.dietaryRestrictionPatterns.find(
      (p: any) => p.restrictionType === "egg_allergy"
    );
    expect(eggPattern?.count).toBe(5);

    const glutenPattern = result.dietaryRestrictionPatterns.find(
      (p: any) => p.restrictionType === "gluten_free"
    );
    expect(glutenPattern?.count).toBe(3);

    expect(result.cookingTimePatterns.length).toBe(3);
    const fifteenMinutes = result.cookingTimePatterns.find(
      (p: any) => p.minutesLimit === 15
    );
    expect(fifteenMinutes?.count).toBe(4);

    const thirtyMinutes = result.cookingTimePatterns.find(
      (p: any) => p.minutesLimit === 30
    );
    expect(thirtyMinutes?.count).toBe(4);

    const sixtyMinutes = result.cookingTimePatterns.find(
      (p: any) => p.minutesLimit === 60
    );
    expect(sixtyMinutes?.count).toBe(3);

    expect(result.budgetConstraintPatterns.length).toBe(2);
    const budget500 = result.budgetConstraintPatterns.find(
      (p: any) => p.dailyBudgetYen === 500
    );
    expect(budget500?.count).toBe(6);

    const budget1000 = result.budgetConstraintPatterns.find(
      (p: any) => p.dailyBudgetYen === 1000
    );
    expect(budget1000?.count).toBe(5);

    // クロス集計検証：(調理時間15分, 予算500円)
    const cross15min500yen = result.combinationPatterns.find(
      (p: any) => p.minutesLimit === 15 && p.dailyBudgetYen === 500
    );
    expect(cross15min500yen?.count).toBe(2); // user_001, user_007

    // クロス集計検証：(調理時間30分, 予算500円)
    const cross30min500yen = result.combinationPatterns.find(
      (p: any) => p.minutesLimit === 30 && p.dailyBudgetYen === 500
    );
    expect(cross30min500yen?.count).toBe(2); // user_008, user_011

    // クロス集計検証：(調理時間15分, 予算1000円)
    const cross15min1000yen = result.combinationPatterns.find(
      (p: any) => p.minutesLimit === 15 && p.dailyBudgetYen === 1000
    );
    expect(cross15min1000yen?.count).toBe(2); // user_004, user_010

    // クロス集計検証：(調理時間30分, 予算1000円)
    const cross30min1000yen = result.combinationPatterns.find(
      (p: any) => p.minutesLimit === 30 && p.dailyBudgetYen === 1000
    );
    expect(cross30min1000yen?.count).toBe(1); // user_005

    // クロス集計検証：(調理時間60分, 予算500円)
    const cross60min500yen = result.combinationPatterns.find(
      (p: any) => p.minutesLimit === 60 && p.dailyBudgetYen === 500
    );
    expect(cross60min500yen?.count).toBe(1); // user_003

    // クロス集計検証：(調理時間60分, 予算1000円)
    const cross60min1000yen = result.combinationPatterns.find(
      (p: any) => p.minutesLimit === 60 && p.dailyBudgetYen === 1000
    );
    expect(cross60min1000yen?.count).toBe(2); // user_006, user_009

    // 全ユーザーデータの網羅性確認
    // クロス集計の合計が総ユーザー数と一致
    const totalFromCombination = result.combinationPatterns.reduce(
      (sum: number, p: any) => sum + p.count,
      0
    );
    expect(totalFromCombination).toBe(11);

    // 重複なし確認：各ユーザーIDが結果に一度だけ現れることを確認
    const extractedUserIds = result.extractedUserIds;
    expect(extractedUserIds.length).toBe(11);
    const uniqueUserIds = new Set(extractedUserIds);
    expect(uniqueUserIds.size).toBe(11);

    // 抽出結果が要求されたセグメント条件を満たしていることを確認
    expect(result.appliedSegmentCriteria).toEqual(segmentCriteria);
  });
});