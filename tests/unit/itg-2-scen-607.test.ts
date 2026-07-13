import { detectAnomalies } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーデータの欠損値・異常値の自動検出と除外', () => {
  // SCEN-607
  test('欠損値・異常値の検出基準が未定義の場合にエラーが発生する', () => {
    const userDataWithMissing = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      recordDate: '2024-01-15',
      nutritionItems: [
        {
          nutrientId: 'nutrient_protein',
          targetValue: 60,
          actualValue: 55,
          unit: 'g'
        },
        {
          nutrientId: 'nutrient_calcium',
          targetValue: 800,
          actualValue: null,
          unit: 'mg'
        },
        {
          nutrientId: 'nutrient_iron',
          targetValue: 18,
          actualValue: 8,
          unit: 'mg'
        }
      ],
      mealEvaluationData: [
        {
          mealId: 'meal_001',
          satisfactionScore: 85,
          completionRate: 100
        },
        {
          mealId: 'meal_002',
          satisfactionScore: null,
          completionRate: 95
        }
      ]
    };

    const detectionCriteriaUndefined = {
      isConfigured: false,
      missingValueThreshold: undefined,
      anomalyRanges: undefined,
      allowedDeviationPercent: undefined
    };

    expect(() =>
      detectAnomalies(userDataWithMissing, detectionCriteriaUndefined)
    ).toThrow(/検出基準/);
  });

  test('検出基準が定義されている場合、欠損値・異常値を正確に検出・除外する', () => {
    const userDataWithAnomalies = {
      userId: 'user_002',
      familyMemberId: 'member_002',
      recordDate: '2024-01-16',
      nutritionItems: [
        {
          nutrientId: 'nutrient_protein',
          targetValue: 60,
          actualValue: 65,
          unit: 'g'
        },
        {
          nutrientId: 'nutrient_calcium',
          targetValue: 800,
          actualValue: null,
          unit: 'mg'
        },
        {
          nutrientId: 'nutrient_iron',
          targetValue: 18,
          actualValue: 500,
          unit: 'mg'
        },
        {
          nutrientId: 'nutrient_vitamin_c',
          targetValue: 100,
          actualValue: 95,
          unit: 'mg'
        }
      ],
      mealEvaluationData: [
        {
          mealId: 'meal_001',
          satisfactionScore: 90,
          completionRate: 100
        },
        {
          mealId: 'meal_002',
          satisfactionScore: 88,
          completionRate: 95
        }
      ]
    };

    const detectionCriteriaDefined = {
      isConfigured: true,
      missingValueThreshold: 0,
      anomalyRanges: {
        nutrient_iron: { min: 0, max: 50 },
        nutrient_calcium: { min: 0, max: 1200 },
        nutrient_protein: { min: 20, max: 150 },
        nutrient_vitamin_c: { min: 0, max: 500 }
      },
      allowedDeviationPercent: 150
    };

    const result = detectAnomalies(userDataWithAnomalies, detectionCriteriaDefined);

    expect(result.detectedAnomalies).toEqual([
      {
        type: 'missing_value',
        nutrientId: 'nutrient_calcium',
        fieldName: 'actualValue',
        severity: 'high'
      },
      {
        type: 'anomaly_value',
        nutrientId: 'nutrient_iron',
        fieldName: 'actualValue',
        recordedValue: 500,
        allowedMax: 50,
        severity: 'high'
      }
    ]);

    expect(result.cleanedData.nutritionItems.length).toBe(2);
    expect(result.cleanedData.nutritionItems).toEqual([
      {
        nutrientId: 'nutrient_protein',
        targetValue: 60,
        actualValue: 65,
        unit: 'g'
      },
      {
        nutrientId: 'nutrient_vitamin_c',
        targetValue: 100,
        actualValue: 95,
        unit: 'mg'
      }
    ]);

    expect(result.cleanedData.mealEvaluationData).toEqual([
      {
        mealId: 'meal_001',
        satisfactionScore: 90,
        completionRate: 100
      },
      {
        mealId: 'meal_002',
        satisfactionScore: 88,
        completionRate: 95
      }
    ]);

    expect(result.filteredRecordCount).toBe(2);
    expect(result.anomalyDetectionLog).toEqual({
      timestamp: '2024-01-16T00:00:00Z',
      userId: 'user_002',
      familyMemberId: 'member_002',
      totalItemsProcessed: 4,
      anomaliesDetected: 2,
      itemsRemoved: 2,
      itemsRetained: 2,
      errorCode: null,
      status: 'completed'
    });
  });

  test('異常値が複数存在する場合、すべてを検出し対象外として除外する', () => {
    const userDataMultipleAnomalies = {
      userId: 'user_003',
      familyMemberId: 'member_003',
      recordDate: '2024-01-17',
      nutritionItems: [
        {
          nutrientId: 'nutrient_protein',
          targetValue: 60,
          actualValue: -10,
          unit: 'g'
        },
        {
          nutrientId: 'nutrient_calcium',
          targetValue: 800,
          actualValue: 2500,
          unit: 'mg'
        },
        {
          nutrientId: 'nutrient_iron',
          targetValue: 18,
          actualValue: 22,
          unit: 'mg'
        },
        {
          nutrientId: 'nutrient_vitamin_c',
          targetValue: 100,
          actualValue: null,
          unit: 'mg'
        }
      ],
      mealEvaluationData: []
    };

    const detectionCriteriaDefined = {
      isConfigured: true,
      missingValueThreshold: 0,
      anomalyRanges: {
        nutrient_protein: { min: 20, max: 150 },
        nutrient_calcium: { min: 400, max: 1200 },
        nutrient_iron: { min: 0, max: 50 },
        nutrient_vitamin_c: { min: 0, max: 500 }
      },
      allowedDeviationPercent: 150
    };

    const result = detectAnomalies(userDataMultipleAnomalies, detectionCriteriaDefined);

    expect(result.detectedAnomalies.length).toBe(3);
    expect(result.cleanedData.nutritionItems).toEqual([
      {
        nutrientId: 'nutrient_iron',
        targetValue: 18,
        actualValue: 22,
        unit: 'mg'
      }
    ]);

    expect(result.filteredRecordCount).toBe(1);
    expect(result.anomalyDetectionLog.anomaliesDetected).toBe(3);
    expect(result.anomalyDetectionLog.itemsRemoved).toBe(3);
    expect(result.anomalyDetectionLog.status).toBe('completed');
  });

  test('正常なデータのみが入力された場合、すべてのデータが保持される', () => {
    const userDataClean = {
      userId: 'user_004',
      familyMemberId: 'member_004',
      recordDate: '2024-01-18',
      nutritionItems: [
        {
          nutrientId: 'nutrient_protein',
          targetValue: 60,
          actualValue: 62,
          unit: 'g'
        },
        {
          nutrientId: 'nutrient_calcium',
          targetValue: 800,
          actualValue: 750,
          unit: 'mg'
        },
        {
          nutrientId: 'nutrient_iron',
          targetValue: 18,
          actualValue: 16,
          unit: 'mg'
        }
      ],
      mealEvaluationData: [
        {
          mealId: 'meal_001',
          satisfactionScore: 92,
          completionRate: 100
        }
      ]
    };

    const detectionCriteriaDefined = {
      isConfigured: true,
      missingValueThreshold: 0,
      anomalyRanges: {
        nutrient_protein: { min: 20, max: 150 },
        nutrient_calcium: { min: 400, max: 1200 },
        nutrient_iron: { min: 0, max: 50 }
      },
      allowedDeviationPercent: 150
    };

    const result = detectAnomalies(userDataClean, detectionCriteriaDefined);

    expect(result.detectedAnomalies.length).toBe(0);
    expect(result.cleanedData.nutritionItems.length).toBe(3);
    expect(result.cleanedData.mealEvaluationData.length).toBe(1);
    expect(result.filteredRecordCount).toBe(3);
    expect(result.anomalyDetectionLog.anomaliesDetected).toBe(0);
    expect(result.anomalyDetectionLog.itemsRemoved).toBe(0);
    expect(result.anomalyDetectionLog.itemsRetained).toBe(3);
    expect(result.anomalyDetectionLog.status).toBe('completed');
    expect(result.anomalyDetectionLog.errorCode).toBeNull();
  });
});