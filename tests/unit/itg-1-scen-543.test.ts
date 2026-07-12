import { detectAnomaliesInMealRecord } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-543: [edge] 異常値・欠損値フィルタリング機能 - 単一レコードの異常値検出が正確に動作する
  test('単一レコードの異常値検出が正確に動作する', () => {
    // 【正常なレコード】
    const normalRecord = {
      mealId: 'meal_001',
      dishName: '鶏もも焼き',
      calories: 450,
      protein: 35,
      carbohydrates: 20,
      fat: 18,
      salt: 1.5,
      fiber: 3.2,
      timestamp: new Date('2024-01-15T12:00:00Z'),
    };

    const normalResult = detectAnomaliesInMealRecord(normalRecord);
    expect(normalResult.hasAnomalies).toBe(false);
    expect(normalResult.anomalies).toEqual([]);

    // 【異常値：カロリーが負の値】
    const negativeCalorieRecord = {
      mealId: 'meal_002',
      dishName: '不正なデータ',
      calories: -150,
      protein: 25,
      carbohydrates: 15,
      fat: 12,
      salt: 0.8,
      fiber: 2.5,
      timestamp: new Date('2024-01-15T13:00:00Z'),
    };

    const negativeCalorieResult = detectAnomaliesInMealRecord(
      negativeCalorieRecord,
    );
    expect(negativeCalorieResult.hasAnomalies).toBe(true);
    expect(negativeCalorieResult.anomalies.length).toBe(1);
    expect(negativeCalorieResult.anomalies[0]).toEqual({
      fieldName: 'calories',
      value: -150,
      reason: 'カロリーが負の値',
      severity: 'critical',
    });

    // 【異常値：タンパク質が3000g】
    const excessiveProteinRecord = {
      mealId: 'meal_003',
      dishName: '異常タンパク質データ',
      calories: 500,
      protein: 3000,
      carbohydrates: 25,
      fat: 20,
      salt: 1.2,
      fiber: 4.0,
      timestamp: new Date('2024-01-15T14:00:00Z'),
    };

    const excessiveProteinResult = detectAnomaliesInMealRecord(
      excessiveProteinRecord,
    );
    expect(excessiveProteinResult.hasAnomalies).toBe(true);
    expect(excessiveProteinResult.anomalies.length).toBe(1);
    expect(excessiveProteinResult.anomalies[0]).toEqual({
      fieldName: 'protein',
      value: 3000,
      reason: 'タンパク質が生物学的に不可能な値',
      severity: 'critical',
    });

    // 【異常値：塩分が100g以上】
    const excessiveSaltRecord = {
      mealId: 'meal_004',
      dishName: '異常塩分データ',
      calories: 480,
      protein: 32,
      carbohydrates: 22,
      fat: 16,
      salt: 120,
      fiber: 3.8,
      timestamp: new Date('2024-01-15T15:00:00Z'),
    };

    const excessiveSaltResult = detectAnomaliesInMealRecord(excessiveSaltRecord);
    expect(excessiveSaltResult.hasAnomalies).toBe(true);
    expect(excessiveSaltResult.anomalies.length).toBe(1);
    expect(excessiveSaltResult.anomalies[0]).toEqual({
      fieldName: 'salt',
      value: 120,
      reason: '塩分が100g以上',
      severity: 'critical',
    });

    // 【複数の異常値：カロリーが負 + 脂肪が負】
    const multipleAnomaliesRecord = {
      mealId: 'meal_005',
      dishName: '複合異常データ',
      calories: -200,
      protein: 28,
      carbohydrates: 18,
      fat: -5,
      salt: 0.9,
      fiber: 2.0,
      timestamp: new Date('2024-01-15T16:00:00Z'),
    };

    const multipleAnomaliesResult = detectAnomaliesInMealRecord(
      multipleAnomaliesRecord,
    );
    expect(multipleAnomaliesResult.hasAnomalies).toBe(true);
    expect(multipleAnomaliesResult.anomalies.length).toBe(2);
    expect(multipleAnomaliesResult.anomalies).toContainEqual({
      fieldName: 'calories',
      value: -200,
      reason: 'カロリーが負の値',
      severity: 'critical',
    });
    expect(multipleAnomaliesResult.anomalies).toContainEqual({
      fieldName: 'fat',
      value: -5,
      reason: '脂肪が負の値',
      severity: 'critical',
    });

    // 【欠損値：タンパク質がnull】
    const missingProteinRecord = {
      mealId: 'meal_006',
      dishName: 'タンパク質欠損',
      calories: 420,
      protein: null,
      carbohydrates: 24,
      fat: 14,
      salt: 1.1,
      fiber: 3.5,
      timestamp: new Date('2024-01-15T17:00:00Z'),
    };

    const missingProteinResult = detectAnomaliesInMealRecord(
      missingProteinRecord,
    );
    expect(missingProteinResult.hasAnomalies).toBe(true);
    expect(missingProteinResult.anomalies.length).toBe(1);
    expect(missingProteinResult.anomalies[0]).toEqual({
      fieldName: 'protein',
      value: null,
      reason: '必須フィールドが欠損',
      severity: 'high',
    });

    // 【境界値：カロリーが0（正常な境界値）】
    const zeroBoundaryRecord = {
      mealId: 'meal_007',
      dishName: 'ゼロカロリー飲料',
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      salt: 0,
      fiber: 0,
      timestamp: new Date('2024-01-15T18:00:00Z'),
    };

    const zeroBoundaryResult = detectAnomaliesInMealRecord(zeroBoundaryRecord);
    expect(zeroBoundaryResult.hasAnomalies).toBe(false);
    expect(zeroBoundaryResult.anomalies).toEqual([]);

    // 【境界値：塩分がちょうど100g（境界線上）】
    const saltBoundaryRecord = {
      mealId: 'meal_008',
      dishName: '塩分境界値',
      calories: 500,
      protein: 30,
      carbohydrates: 20,
      fat: 15,
      salt: 100,
      fiber: 4.0,
      timestamp: new Date('2024-01-15T19:00:00Z'),
    };

    const saltBoundaryResult = detectAnomaliesInMealRecord(saltBoundaryRecord);
    expect(saltBoundaryResult.hasAnomalies).toBe(true);
    expect(saltBoundaryResult.anomalies.length).toBe(1);
    expect(saltBoundaryResult.anomalies[0]).toEqual({
      fieldName: 'salt',
      value: 100,
      reason: '塩分が100g以上',
      severity: 'critical',
    });

    // 【境界値：塩分がちょうど99.9g（正常な上限値）】
    const saltNormalBoundaryRecord = {
      mealId: 'meal_009',
      dishName: '塩分正常上限',
      calories: 490,
      protein: 32,
      carbohydrates: 21,
      fat: 16,
      salt: 99.9,
      fiber: 3.9,
      timestamp: new Date('2024-01-15T20:00:00Z'),
    };

    const saltNormalBoundaryResult = detectAnomaliesInMealRecord(
      saltNormalBoundaryRecord,
    );
    expect(saltNormalBoundaryResult.hasAnomalies).toBe(false);
    expect(saltNormalBoundaryResult.anomalies).toEqual([]);

    // 【タンパク質が999.9g（異常だが3000未満）】
    const highProteinRecord = {
      mealId: 'meal_010',
      dishName: 'タンパク質高値',
      calories: 520,
      protein: 999.9,
      carbohydrates: 26,
      fat: 19,
      salt: 1.3,
      fiber: 4.2,
      timestamp: new Date('2024-01-15T21:00:00Z'),
    };

    const highProteinResult = detectAnomaliesInMealRecord(highProteinRecord);
    expect(highProteinResult.hasAnomalies).toBe(true);
    expect(highProteinResult.anomalies.length).toBe(1);
    expect(highProteinResult.anomalies[0]).toEqual({
      fieldName: 'protein',
      value: 999.9,
      reason: 'タンパク質が生物学的に不可能な値',
      severity: 'critical',
    });
  });
});