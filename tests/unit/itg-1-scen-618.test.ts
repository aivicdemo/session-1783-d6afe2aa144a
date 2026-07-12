import { detectAndCorrectMissingValues } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-618: [edge] ユーザーデータの欠損値・異常値検出と補正 - 欠損率が閾値（例：10%）の境界値で正常に補正判定される
  test('欠損率が10%の境界値で補正判定が正しく機能すること', () => {
    // ========== テストデータ準備 ==========
    // 欠損率10% のデータセット（100項目中10項目が欠損）
    const userData10PercentMissing = {
      userId: 'user-001',
      familyMembers: [
        { memberId: 'fm-001', name: 'Parent1', age: 40, satisfactionScore: 4 },
        { memberId: 'fm-002', name: 'Parent2', age: 38, satisfactionScore: 3 },
        { memberId: 'fm-003', name: 'Child1', age: 12, satisfactionScore: 5 },
        { memberId: 'fm-004', name: 'Child2', age: 10, satisfactionScore: null }, // 欠損
        { memberId: 'fm-005', name: 'Child3', age: 8, satisfactionScore: null },  // 欠損
      ],
      mealRecords: Array.from({ length: 50 }, (_, i) => ({
        recordId: `meal-${String(i).padStart(3, '0')}`,
        mealDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        dishName: `Dish${i}`,
        completionRate: i < 40 ? 0.9 : null, // 40～49番目の10項目が欠損
      })),
      nutritionData: [
        { nutrientId: 'n-001', nutrientName: 'Protein', actualValue: 65, targetValue: 70 },
        { nutrientId: 'n-002', nutrientName: 'Carbs', actualValue: 300, targetValue: 350 },
        { nutrientId: 'n-003', nutrientName: 'Fat', actualValue: 55, targetValue: 60 },
        { nutrientId: 'n-004', nutrientName: 'Fiber', actualValue: 20, targetValue: 25 },
        { nutrientId: 'n-005', nutrientName: 'Calcium', actualValue: 600, targetValue: 800 },
      ],
    };

    // 欠損率9% のデータセット（100項目中9項目が欠損）
    const userData9PercentMissing = {
      userId: 'user-002',
      familyMembers: [
        { memberId: 'fm-001', name: 'Parent1', age: 40, satisfactionScore: 4 },
        { memberId: 'fm-002', name: 'Parent2', age: 38, satisfactionScore: 3 },
        { memberId: 'fm-003', name: 'Child1', age: 12, satisfactionScore: 5 },
        { memberId: 'fm-004', name: 'Child2', age: 10, satisfactionScore: null }, // 欠損
      ],
      mealRecords: Array.from({ length: 50 }, (_, i) => ({
        recordId: `meal-${String(i).padStart(3, '0')}`,
        mealDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        dishName: `Dish${i}`,
        completionRate: i < 41 ? 0.9 : null, // 41～49番目の9項目が欠損
      })),
      nutritionData: [
        { nutrientId: 'n-001', nutrientName: 'Protein', actualValue: 65, targetValue: 70 },
        { nutrientId: 'n-002', nutrientName: 'Carbs', actualValue: 300, targetValue: 350 },
        { nutrientId: 'n-003', nutrientName: 'Fat', actualValue: 55, targetValue: 60 },
        { nutrientId: 'n-004', nutrientName: 'Fiber', actualValue: 20, targetValue: 25 },
        { nutrientId: 'n-005', nutrientName: 'Calcium', actualValue: 600, targetValue: 800 },
      ],
    };

    // 欠損率11% のデータセット（100項目中11項目が欠損）
    const userData11PercentMissing = {
      userId: 'user-003',
      familyMembers: [
        { memberId: 'fm-001', name: 'Parent1', age: 40, satisfactionScore: 4 },
        { memberId: 'fm-002', name: 'Parent2', age: 38, satisfactionScore: 3 },
        { memberId: 'fm-003', name: 'Child1', age: 12, satisfactionScore: 5 },
        { memberId: 'fm-004', name: 'Child2', age: 10, satisfactionScore: null }, // 欠損
        { memberId: 'fm-005', name: 'Child3', age: 8, satisfactionScore: null },  // 欠損
        { memberId: 'fm-006', name: 'Child4', age: 6, satisfactionScore: null },  // 欠損
      ],
      mealRecords: Array.from({ length: 50 }, (_, i) => ({
        recordId: `meal-${String(i).padStart(3, '0')}`,
        mealDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
        dishName: `Dish${i}`,
        completionRate: i < 39 ? 0.9 : null, // 39～49番目の11項目が欠損
      })),
      nutritionData: [
        { nutrientId: 'n-001', nutrientName: 'Protein', actualValue: 65, targetValue: 70 },
        { nutrientId: 'n-002', nutrientName: 'Carbs', actualValue: 300, targetValue: 350 },
        { nutrientId: 'n-003', nutrientName: 'Fat', actualValue: 55, targetValue: 60 },
        { nutrientId: 'n-004', nutrientName: 'Fiber', actualValue: 20, targetValue: 25 },
        { nutrientId: 'n-005', nutrientName: 'Calcium', actualValue: 600, targetValue: 800 },
      ],
    };

    // ========== 欠損率10% のケース実行 ==========
    const result10Percent = detectAndCorrectMissingValues(userData10PercentMissing, 0.1);
    expect(result10Percent.missingRate).toBe(0.1);
    expect(result10Percent.shouldCorrect).toBe(true);
    expect(result10Percent.correctionApplied).toBe(true);
    expect(result10Percent.correctionLog).toContain('補正対象');
    // 補正後のデータが妥当な値で埋められていることを検証
    expect(result10Percent.correctedData.familyMembers).toHaveLength(5);
    expect(result10Percent.correctedData.familyMembers[3].satisfactionScore).not.toBeNull();
    expect(result10Percent.correctedData.familyMembers[4].satisfactionScore).not.toBeNull();
    expect(result10Percent.correctedData.mealRecords.filter((r: any) => r.completionRate !== null).length).toBeGreaterThan(40);

    // ========== 欠損率9% のケース実行 ==========
    const result9Percent = detectAndCorrectMissingValues(userData9PercentMissing, 0.1);
    expect(result9Percent.missingRate).toBe(0.09);
    expect(result9Percent.shouldCorrect).toBe(false);
    expect(result9Percent.correctionApplied).toBe(false);
    expect(result9Percent.correctionLog).toContain('補正対象外');

    // ========== 欠損率11% のケース実行 ==========
    const result11Percent = detectAndCorrectMissingValues(userData11PercentMissing, 0.1);
    expect(result11Percent.missingRate).toBe(0.11);
    expect(result11Percent.shouldCorrect).toBe(true);
    expect(result11Percent.correctionApplied).toBe(true);
    expect(result11Percent.correctionLog).toContain('補正対象');
    // 補正後のデータが妥当な値で埋められていることを検証
    expect(result11Percent.correctedData.familyMembers).toHaveLength(6);
    expect(result11Percent.correctedData.familyMembers[3].satisfactionScore).not.toBeNull();
    expect(result11Percent.correctedData.familyMembers[4].satisfactionScore).not.toBeNull();
    expect(result11Percent.correctedData.familyMembers[5].satisfactionScore).not.toBeNull();
    expect(result11Percent.correctedData.mealRecords.filter((r: any) => r.completionRate !== null).length).toBeGreaterThan(38);

    // ========== 境界値検証 ==========
    // 欠損率が正確に閾値10%で検出されることを確認
    expect(result10Percent.missingRate).toBe(0.1);
    // 10%と11%のデータは補正対象として処理される
    expect(result10Percent.shouldCorrect).toBe(true);
    expect(result11Percent.shouldCorrect).toBe(true);
    // 9%のデータは補正対象外として処理される
    expect(result9Percent.shouldCorrect).toBe(false);
  });
});