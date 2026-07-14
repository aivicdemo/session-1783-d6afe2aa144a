import { validatePredictionAccuracy } from '../../src/logic/it-7-2-1';

describe('予測精度検証と改善判定', () => {
  // SCEN-750: [normal] 予測精度検証機能 - 算出した精度率が改善判定閾値と比較され、改善要否が判定される
  test('精度率が改善判定閾値と比較され改善要否が正しく判定される', () => {
    const predictionAccuracyThreshold = 85;
    const calculatedAccuracyRate = 82;
    
    const result = validatePredictionAccuracy({
      accuracyRate: calculatedAccuracyRate,
      threshold: predictionAccuracyThreshold,
      modelId: 'model-test-001',
      evaluationPeriod: '2024-01-01',
      timestamp: '2024-01-15T11:00:00Z'
    });

    expect(result.requiresImprovement).toBe(true);
    expect(result.improvementDecision).toBe('改善要');
    expect(result.accuracyRate).toBe(82);
    expect(result.threshold).toBe(85);
    expect(result.gap).toBe(-3);
    expect(result.displayMessage).toBe('精度率が閾値未満のため改善が必要です');
    expect(result.isRecorded).toBe(true);
  });

  test('精度率が改善判定閾値以上の場合は改善不要と判定される', () => {
    const predictionAccuracyThreshold = 80;
    const calculatedAccuracyRate = 90;

    const result = validatePredictionAccuracy({
      accuracyRate: calculatedAccuracyRate,
      threshold: predictionAccuracyThreshold,
      modelId: 'model-test-002',
      evaluationPeriod: '2024-01-08',
      timestamp: '2024-01-15T12:30:00Z'
    });

    expect(result.requiresImprovement).toBe(false);
    expect(result.improvementDecision).toBe('改善不要');
    expect(result.accuracyRate).toBe(90);
    expect(result.threshold).toBe(80);
    expect(result.gap).toBe(10);
    expect(result.displayMessage).toBe('精度率が閾値以上であり改善は不要です');
    expect(result.isRecorded).toBe(true);
  });

  test('精度率が改善判定閾値と等しい場合は改善不要と判定される', () => {
    const predictionAccuracyThreshold = 85;
    const calculatedAccuracyRate = 85;

    const result = validatePredictionAccuracy({
      accuracyRate: calculatedAccuracyRate,
      threshold: predictionAccuracyThreshold,
      modelId: 'model-test-003',
      evaluationPeriod: '2024-01-01',
      timestamp: '2024-01-15T14:00:00Z'
    });

    expect(result.requiresImprovement).toBe(false);
    expect(result.improvementDecision).toBe('改善不要');
    expect(result.accuracyRate).toBe(85);
    expect(result.threshold).toBe(85);
    expect(result.gap).toBe(0);
    expect(result.isRecorded).toBe(true);
  });

  test('精度率が0より小さい場合はエラーが発生する', () => {
    expect(() =>
      validatePredictionAccuracy({
        accuracyRate: -5,
        threshold: 80,
        modelId: 'model-test-004',
        evaluationPeriod: '2024-01-01',
        timestamp: '2024-01-15T15:00:00Z'
      })
    ).toThrow(/精度率/);
  });

  test('精度率が100を超える場合はエラーが発生する', () => {
    expect(() =>
      validatePredictionAccuracy({
        accuracyRate: 105,
        threshold: 80,
        modelId: 'model-test-005',
        evaluationPeriod: '2024-01-01',
        timestamp: '2024-01-15T16:00:00Z'
      })
    ).toThrow(/精度率/);
  });

  test('改善判定閾値が負の値の場合はエラーが発生する', () => {
    expect(() =>
      validatePredictionAccuracy({
        accuracyRate: 85,
        threshold: -10,
        modelId: 'model-test-006',
        evaluationPeriod: '2024-01-01',
        timestamp: '2024-01-15T17:00:00Z'
      })
    ).toThrow(/閾値/);
  });

  test('modelIdが空文字列の場合はエラーが発生する', () => {
    expect(() =>
      validatePredictionAccuracy({
        accuracyRate: 85,
        threshold: 80,
        modelId: '',
        evaluationPeriod: '2024-01-01',
        timestamp: '2024-01-15T18:00:00Z'
      })
    ).toThrow(/モデル/);
  });

  test('判定結果がシステムに正確に記録される', () => {
    const predictionAccuracyThreshold = 75;
    const calculatedAccuracyRate = 78;

    const result = validatePredictionAccuracy({
      accuracyRate: calculatedAccuracyRate,
      threshold: predictionAccuracyThreshold,
      modelId: 'model-test-007',
      evaluationPeriod: '2024-01-08',
      timestamp: '2024-01-15T19:45:00Z'
    });

    expect(result.requiresImprovement).toBe(false);
    expect(result.accuracyRate).toBe(78);
    expect(result.threshold).toBe(75);
    expect(result.gap).toBe(3);
    expect(result.isRecorded).toBe(true);
    expect(result.modelId).toBe('model-test-007');
    expect(result.evaluationPeriod).toBe('2024-01-08');
    expect(result.timestamp).toBe('2024-01-15T19:45:00Z');
  });

  test('複数のモデルに対して個別に改善判定が実行される', () => {
    const result1 = validatePredictionAccuracy({
      accuracyRate: 70,
      threshold: 80,
      modelId: 'model-A',
      evaluationPeriod: '2024-01-01',
      timestamp: '2024-01-15T10:00:00Z'
    });

    const result2 = validatePredictionAccuracy({
      accuracyRate: 92,
      threshold: 85,
      modelId: 'model-B',
      evaluationPeriod: '2024-01-01',
      timestamp: '2024-01-15T10:00:00Z'
    });

    expect(result1.requiresImprovement).toBe(true);
    expect(result1.improvementDecision).toBe('改善要');
    expect(result2.requiresImprovement).toBe(false);
    expect(result2.improvementDecision).toBe('改善不要');
  });

  test('浮動小数点の精度率が正確に比較される', () => {
    const predictionAccuracyThreshold = 85.5;
    const calculatedAccuracyRate = 85.49;

    const result = validatePredictionAccuracy({
      accuracyRate: calculatedAccuracyRate,
      threshold: predictionAccuracyThreshold,
      modelId: 'model-test-008',
      evaluationPeriod: '2024-01-01',
      timestamp: '2024-01-15T20:00:00Z'
    });

    expect(result.requiresImprovement).toBe(true);
    expect(result.improvementDecision).toBe('改善要');
    expect(result.gap).toBeCloseTo(-0.01, 2);
    expect(result.isRecorded).toBe(true);
  });
});