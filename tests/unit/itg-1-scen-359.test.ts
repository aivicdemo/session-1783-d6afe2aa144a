import { validateMealEvaluationScore } from "../../src/logic/it-2";

describe("家族成員の食事評価データ蓄積・管理機能", () => {
  // SCEN-359
  test("評価スコアが許容範囲外の場合、エラーを発生させる", () => {
    const invalidScores = [-1, 0, 6, 10, -100, 100];
    
    invalidScores.forEach((score) => {
      expect(() => 
        validateMealEvaluationScore({
          mealId: "meal_001",
          familyMemberId: "member_123",
          satisfactionScore: score,
          timestamp: new Date("2024-01-15T19:30:00Z"),
        })
      ).toThrow(/満足度/);
    });
  });

  test("評価スコアが許容範囲内の場合、評価データが蓄積される", () => {
    const validScores = [1, 2, 3, 4, 5];
    
    validScores.forEach((score) => {
      const evaluationData = {
        mealId: "meal_001",
        familyMemberId: "member_123",
        satisfactionScore: score,
        completionRate: 80,
        userRequest: "もっと塩辛くしてほしい",
        timestamp: new Date("2024-01-15T19:30:00Z"),
      };

      const result = validateMealEvaluationScore(evaluationData);
      
      expect(result).toEqual({
        mealId: "meal_001",
        familyMemberId: "member_123",
        satisfactionScore: score,
        completionRate: 80,
        userRequest: "もっと塩辛くしてほしい",
        timestamp: new Date("2024-01-15T19:30:00Z"),
        isValid: true,
        accumulatedAt: expect.any(Date),
      });
    });
  });

  test("満足度1の下限値と5の上限値は有効である", () => {
    const minScoreResult = validateMealEvaluationScore({
      mealId: "meal_002",
      familyMemberId: "member_456",
      satisfactionScore: 1,
      timestamp: new Date("2024-01-16T20:00:00Z"),
    });
    expect(minScoreResult.isValid).toBe(true);
    expect(minScoreResult.satisfactionScore).toBe(1);

    const maxScoreResult = validateMealEvaluationScore({
      mealId: "meal_003",
      familyMemberId: "member_789",
      satisfactionScore: 5,
      timestamp: new Date("2024-01-16T20:15:00Z"),
    });
    expect(maxScoreResult.isValid).toBe(true);
    expect(maxScoreResult.satisfactionScore).toBe(5);
  });

  test("浮動小数点数のスコアは拒否される", () => {
    expect(() =>
      validateMealEvaluationScore({
        mealId: "meal_004",
        familyMemberId: "member_999",
        satisfactionScore: 3.5,
        timestamp: new Date("2024-01-17T19:45:00Z"),
      })
    ).toThrow(/整数/);
  });

  test("スコアがnullまたはundefinedの場合、エラーを発生させる", () => {
    expect(() =>
      validateMealEvaluationScore({
        mealId: "meal_005",
        familyMemberId: "member_111",
        satisfactionScore: null as any,
        timestamp: new Date("2024-01-18T20:30:00Z"),
      })
    ).toThrow(/必須/);

    expect(() =>
      validateMealEvaluationScore({
        mealId: "meal_006",
        familyMemberId: "member_222",
        satisfactionScore: undefined as any,
        timestamp: new Date("2024-01-18T20:45:00Z"),
      })
    ).toThrow(/必須/);
  });
});