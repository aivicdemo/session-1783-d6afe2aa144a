import { compareAlgorithmPerformance } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善案の精度向上判定機能', () => {
  test('SCEN-613: 改善前後のアルゴリズム性能データが不完全な場合、比較判定がエラー状態で返される', () => {
    // === 改善前データが不完全な場合 ===
    const incompleteBeforeData = {
      algorithmVersion: 'v1.0',
      generationSuccessRate: 75.5,
      cookingTimeReductionDegree: 12.3,
      // userSatisfactionScore が欠落
    };

    const completeAfterData = {
      algorithmVersion: 'v1.1',
      generationSuccessRate: 82.1,
      cookingTimeReductionDegree: 18.7,
      userSatisfactionScore: 4.2,
      evaluationTimestamp: '2024-01-22T10:00:00Z',
    };

    // 改善前データが不完全な場合のエラー検証
    const resultBeforeIncomplete = compareAlgorithmPerformance(
      incompleteBeforeData as any,
      completeAfterData
    );

    expect(resultBeforeIncomplete.status).toBe(400);
    expect(resultBeforeIncomplete.error).toMatch(/必須フィールド/);
    expect(resultBeforeIncomplete.error).toMatch(/userSatisfactionScore/);
    expect(resultBeforeIncomplete.details).toBeDefined();
    expect(resultBeforeIncomplete.details.incompleteDataset).toBe('before');

    // === 改善後データが不完全な場合 ===
    const completeBeforeData = {
      algorithmVersion: 'v1.0',
      generationSuccessRate: 75.5,
      cookingTimeReductionDegree: 12.3,
      userSatisfactionScore: 3.8,
      evaluationTimestamp: '2024-01-15T10:00:00Z',
    };

    const incompleteAfterData = {
      algorithmVersion: 'v1.1',
      generationSuccessRate: 82.1,
      cookingTimeReductionDegree: 18.7,
      // userSatisfactionScore が欠落
      evaluationTimestamp: '2024-01-22T10:00:00Z',
    };

    const resultAfterIncomplete = compareAlgorithmPerformance(
      completeBeforeData,
      incompleteAfterData as any
    );

    expect(resultAfterIncomplete.status).toBe(400);
    expect(resultAfterIncomplete.error).toMatch(/必須フィールド/);
    expect(resultAfterIncomplete.error).toMatch(/userSatisfactionScore/);
    expect(resultAfterIncomplete.details).toBeDefined();
    expect(resultAfterIncomplete.details.incompleteDataset).toBe('after');

    // === 両方のデータが不完全な場合 ===
    const incompleteBefore = {
      algorithmVersion: 'v1.0',
      generationSuccessRate: 75.5,
      // cookingTimeReductionDegree が欠落
      userSatisfactionScore: 3.8,
    };

    const incompleteAfter = {
      algorithmVersion: 'v1.1',
      generationSuccessRate: 82.1,
      cookingTimeReductionDegree: 18.7,
      // userSatisfactionScore が欠落
    };

    const resultBothIncomplete = compareAlgorithmPerformance(
      incompleteBefore as any,
      incompleteAfter as any
    );

    expect(resultBothIncomplete.status).toBe(400);
    expect(resultBothIncomplete.error).toMatch(/必須フィールド/);
    expect(resultBothIncomplete.details).toBeDefined();

    // === 改善前データに複数の必須フィールドが欠落 ===
    const multipleFieldsMissingBefore = {
      algorithmVersion: 'v1.0',
      // generationSuccessRate が欠落
      // cookingTimeReductionDegree が欠落
      userSatisfactionScore: 3.8,
    };

    const resultMultipleMissing = compareAlgorithmPerformance(
      multipleFieldsMissingBefore as any,
      completeAfterData
    );

    expect(resultMultipleMissing.status).toBe(400);
    expect(resultMultipleMissing.error).toMatch(/必須フィールド/);
    expect(resultMultipleMissing.details).toBeDefined();
    expect(resultMultipleMissing.details.incompleteDataset).toBe('before');
    expect(Array.isArray(resultMultipleMissing.details.missingFields)).toBe(true);

    // === 改善前データが null の場合 ===
    const resultNullBefore = compareAlgorithmPerformance(null as any, completeAfterData);

    expect(resultNullBefore.status).toBe(400);
    expect(resultNullBefore.error).toMatch(/必須フィールド|不完全/);

    // === 改善後データが null の場合 ===
    const resultNullAfter = compareAlgorithmPerformance(completeBeforeData, null as any);

    expect(resultNullAfter.status).toBe(400);
    expect(resultNullAfter.error).toMatch(/必須フィールド|不完全/);

    // === 改善前データに evaluationTimestamp が欠落 ===
    const beforeWithoutTimestamp = {
      algorithmVersion: 'v1.0',
      generationSuccessRate: 75.5,
      cookingTimeReductionDegree: 12.3,
      userSatisfactionScore: 3.8,
      // evaluationTimestamp が欠落
    };

    const resultTimestampMissing = compareAlgorithmPerformance(
      beforeWithoutTimestamp as any,
      completeAfterData
    );

    expect(resultTimestampMissing.status).toBe(400);
    expect(resultTimestampMissing.error).toMatch(/必須フィールド/);
    expect(resultTimestampMissing.details.incompleteDataset).toBe('before');

    // === 改善後データに algorithmVersion が欠落 ===
    const afterWithoutVersion = {
      // algorithmVersion が欠落
      generationSuccessRate: 82.1,
      cookingTimeReductionDegree: 18.7,
      userSatisfactionScore: 4.2,
      evaluationTimestamp: '2024-01-22T10:00:00Z',
    };

    const resultVersionMissing = compareAlgorithmPerformance(
      completeBeforeData,
      afterWithoutVersion as any
    );

    expect(resultVersionMissing.status).toBe(400);
    expect(resultVersionMissing.error).toMatch(/必須フィールド/);
    expect(resultVersionMissing.details.incompleteDataset).toBe('after');
  });
});