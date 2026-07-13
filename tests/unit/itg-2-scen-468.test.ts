import {
  calculateNutrientAchievementScores,
} from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養基準ロジック評価機能 - 達成度スコア算出', () => {
  // SCEN-468
  test('栄養項目ごとの達成度スコアが0〜100の範囲で正しく算出される', () => {
    // ===== Setup: テスト用ユーザーデータ（年齢、性別、活動レベル） =====
    const userData = {
      age: 35,
      gender: 'male' as const,
      activityLevel: 'moderate' as const,
    };

    // ===== Test Case 1: 基準値相当のパターン =====
    const intakeAtStandard = {
      userId: 'user_001',
      date: '2024-01-15',
      nutrients: {
        protein: { intake: 60, unit: 'g' },
        fat: { intake: 70, unit: 'g' },
        carbohydrate: { intake: 350, unit: 'g' },
        vitaminA: { intake: 800, unit: 'mcg' },
        vitaminC: { intake: 100, unit: 'mg' },
        calcium: { intake: 800, unit: 'mg' },
        iron: { intake: 8, unit: 'mg' },
      },
    };

    const resultAtStandard = calculateNutrientAchievementScores(
      userData,
      intakeAtStandard
    );

    // 基準値相当時はスコア100を期待
    expect(resultAtStandard.protein).toBe(100);
    expect(resultAtStandard.fat).toBe(100);
    expect(resultAtStandard.carbohydrate).toBe(100);
    expect(resultAtStandard.vitaminA).toBe(100);
    expect(resultAtStandard.vitaminC).toBe(100);
    expect(resultAtStandard.calcium).toBe(100);
    expect(resultAtStandard.iron).toBe(100);

    // ===== Test Case 2: 基準値未満のパターン（50%）=====
    const intakeBelowStandard = {
      userId: 'user_001',
      date: '2024-01-16',
      nutrients: {
        protein: { intake: 30, unit: 'g' },
        fat: { intake: 35, unit: 'g' },
        carbohydrate: { intake: 175, unit: 'g' },
        vitaminA: { intake: 400, unit: 'mcg' },
        vitaminC: { intake: 50, unit: 'mg' },
        calcium: { intake: 400, unit: 'mg' },
        iron: { intake: 4, unit: 'mg' },
      },
    };

    const resultBelowStandard = calculateNutrientAchievementScores(
      userData,
      intakeBelowStandard
    );

    // 基準値の50%摂取時はスコア50を期待
    expect(resultBelowStandard.protein).toBe(50);
    expect(resultBelowStandard.fat).toBe(50);
    expect(resultBelowStandard.carbohydrate).toBe(50);
    expect(resultBelowStandard.vitaminA).toBe(50);
    expect(resultBelowStandard.vitaminC).toBe(50);
    expect(resultBelowStandard.calcium).toBe(50);
    expect(resultBelowStandard.iron).toBe(50);

    // ===== Test Case 3: 基準値超過のパターン（150%） =====
    const intakeAboveStandard = {
      userId: 'user_001',
      date: '2024-01-17',
      nutrients: {
        protein: { intake: 90, unit: 'g' },
        fat: { intake: 105, unit: 'g' },
        carbohydrate: { intake: 525, unit: 'g' },
        vitaminA: { intake: 1200, unit: 'mcg' },
        vitaminC: { intake: 150, unit: 'mg' },
        calcium: { intake: 1200, unit: 'mg' },
        iron: { intake: 12, unit: 'mg' },
      },
    };

    const resultAboveStandard = calculateNutrientAchievementScores(
      userData,
      intakeAboveStandard
    );

    // 基準値の150%摂取時はスコア100を期待（上限100）
    expect(resultAboveStandard.protein).toBe(100);
    expect(resultAboveStandard.fat).toBe(100);
    expect(resultAboveStandard.carbohydrate).toBe(100);
    expect(resultAboveStandard.vitaminA).toBe(100);
    expect(resultAboveStandard.vitaminC).toBe(100);
    expect(resultAboveStandard.calcium).toBe(100);
    expect(resultAboveStandard.iron).toBe(100);

    // ===== Test Case 4: ゼロ摂取のパターン =====
    const intakeZero = {
      userId: 'user_001',
      date: '2024-01-18',
      nutrients: {
        protein: { intake: 0, unit: 'g' },
        fat: { intake: 0, unit: 'g' },
        carbohydrate: { intake: 0, unit: 'g' },
        vitaminA: { intake: 0, unit: 'mcg' },
        vitaminC: { intake: 0, unit: 'mg' },
        calcium: { intake: 0, unit: 'mg' },
        iron: { intake: 0, unit: 'mg' },
      },
    };

    const resultZero = calculateNutrientAchievementScores(userData, intakeZero);

    // ゼロ摂取時はスコア0を期待
    expect(resultZero.protein).toBe(0);
    expect(resultZero.fat).toBe(0);
    expect(resultZero.carbohydrate).toBe(0);
    expect(resultZero.vitaminA).toBe(0);
    expect(resultZero.vitaminC).toBe(0);
    expect(resultZero.calcium).toBe(0);
    expect(resultZero.iron).toBe(0);

    // ===== Test Case 5: 境界値テスト（スコア75）=====
    const intakeBoundary75 = {
      userId: 'user_001',
      date: '2024-01-19',
      nutrients: {
        protein: { intake: 45, unit: 'g' },
        fat: { intake: 52.5, unit: 'g' },
        carbohydrate: { intake: 262.5, unit: 'g' },
        vitaminA: { intake: 600, unit: 'mcg' },
        vitaminC: { intake: 75, unit: 'mg' },
        calcium: { intake: 600, unit: 'mg' },
        iron: { intake: 6, unit: 'mg' },
      },
    };

    const resultBoundary75 = calculateNutrientAchievementScores(
      userData,
      intakeBoundary75
    );

    // 基準値の75%摂取時はスコア75を期待
    expect(resultBoundary75.protein).toBe(75);
    expect(resultBoundary75.fat).toBe(75);
    expect(resultBoundary75.carbohydrate).toBe(75);
    expect(resultBoundary75.vitaminA).toBe(75);
    expect(resultBoundary75.vitaminC).toBe(75);
    expect(resultBoundary75.calcium).toBe(75);
    expect(resultBoundary75.iron).toBe(75);

    // ===== Test Case 6: 範囲チェック - すべてのスコアが0以上100以下であることを検証 =====
    const allResults = [
      resultAtStandard,
      resultBelowStandard,
      resultAboveStandard,
      resultZero,
      resultBoundary75,
    ];

    allResults.forEach((result) => {
      Object.values(result).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    // ===== Test Case 7: スコアが段階的に変化することを検証 =====
    // 摂取量を段階的に増やしてスコアが段階的に上昇することを確認
    const stepwiseIntake = [
      {
        userId: 'user_001',
        date: '2024-01-20',
        nutrients: {
          protein: { intake: 12, unit: 'g' },
          fat: { intake: 14, unit: 'g' },
          carbohydrate: { intake: 70, unit: 'g' },
          vitaminA: { intake: 160, unit: 'mcg' },
          vitaminC: { intake: 20, unit: 'mg' },
          calcium: { intake: 160, unit: 'mg' },
          iron: { intake: 1.6, unit: 'mg' },
        },
      },
      {
        userId: 'user_001',
        date: '2024-01-21',
        nutrients: {
          protein: { intake: 24, unit: 'g' },
          fat: { intake: 28, unit: 'g' },
          carbohydrate: { intake: 140, unit: 'g' },
          vitaminA: { intake: 320, unit: 'mcg' },
          vitaminC: { intake: 40, unit: 'mg' },
          calcium: { intake: 320, unit: 'mg' },
          iron: { intake: 3.2, unit: 'mg' },
        },
      },
      {
        userId: 'user_001',
        date: '2024-01-22',
        nutrients: {
          protein: { intake: 36, unit: 'g' },
          fat: { intake: 42, unit: 'g' },
          carbohydrate: { intake: 210, unit: 'g' },
          vitaminA: { intake: 480, unit: 'mcg' },
          vitaminC: { intake: 60, unit: 'mg' },
          calcium: { intake: 480, unit: 'mg' },
          iron: { intake: 4.8, unit: 'mg' },
        },
      },
    ];

    const stepwiseResults = stepwiseIntake.map((intake) =>
      calculateNutrientAchievementScores(userData, intake)
    );

    // 摂取量が増えるにつれてスコアが段階的に上昇することを確認
    expect(stepwiseResults[0].protein).toBe(20);
    expect(stepwiseResults[1].protein).toBe(40);
    expect(stepwiseResults[2].protein).toBe(60);

    expect(stepwiseResults[0].protein < stepwiseResults[1].protein).toBe(true);
    expect(stepwiseResults[1].protein < stepwiseResults[2].protein).toBe(true);

    // ===== Test Case 8: 各栄養項目が独立して計算されることを検証 =====
    const independentIntake = {
      userId: 'user_001',
      date: '2024-01-23',
      nutrients: {
        protein: { intake: 60, unit: 'g' },
        fat: { intake: 0, unit: 'g' },
        carbohydrate: { intake: 350, unit: 'g' },
        vitaminA: { intake: 400, unit: 'mcg' },
        vitaminC: { intake: 200, unit: 'mg' },
        calcium: { intake: 0, unit: 'mg' },
        iron: { intake: 16, unit: 'mg' },
      },
    };

    const resultIndependent = calculateNutrientAchievementScores(
      userData,
      independentIntake
    );

    // 個別項目が独立して計算されることを確認
    expect(resultIndependent.protein).toBe(100);
    expect(resultIndependent.fat).toBe(0);
    expect(resultIndependent.carbohydrate).toBe(100);
    expect(resultIndependent.vitaminA).toBe(50);
    expect(resultIndependent.vitaminC).toBe(100);
    expect(resultIndependent.calcium).toBe(0);
    expect(resultIndependent.iron).toBe(100);
  });
});