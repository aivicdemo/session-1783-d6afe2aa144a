import { analyzeQualitativeQuantitativeDataIntegration } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能 - 定性定量データ統合分析', () => {
  // SCEN-316: [error] 定性定量データ統合分析・ペイン優先度可視化機能 - 定性データと定量データの形式が不整合である場合、データ形式エラーが返される
  test('定量データの形式が不整合な場合、データ形式エラーが返される', () => {
    // Arrange: 定性データ（テキスト形式）と定量データ（数値形式）を準備
    const qualitativeData = {
      interviewId: 'INT-001',
      userId: 'USER-001',
      segmentType: 'full_time_househusband',
      painCategory: 'cooking_time_restriction',
      feedbackText: '毎日30分以内に調理を完了させる必要があります',
      recordedAt: '2024-01-15T10:30:00Z',
    };

    const validQuantitativeData = {
      featureId: 'FEAT-001',
      usageFrequency: 45,
      abandonmentRate: 0.12,
      improvementPriority: 8.5,
      sampleSize: 150,
    };

    // Act & Assert 1: 定量データが文字列形式の場合
    const invalidData1 = {
      ...qualitativeData,
      quantitativeData: {
        ...validQuantitativeData,
        usageFrequency: '45',
      },
    };

    expect(() =>
      analyzeQualitativeQuantitativeDataIntegration(invalidData1)
    ).toThrow(/データ形式/);

    // Act & Assert 2: 定量データが null の場合
    const invalidData2 = {
      ...qualitativeData,
      quantitativeData: {
        ...validQuantitativeData,
        abandonmentRate: null,
      },
    };

    expect(() =>
      analyzeQualitativeQuantitativeDataIntegration(invalidData2)
    ).toThrow(/データ形式/);

    // Act & Assert 3: 定量データが undefined の場合
    const invalidData3 = {
      ...qualitativeData,
      quantitativeData: {
        usageFrequency: 45,
        abandonmentRate: undefined,
        improvementPriority: 8.5,
        sampleSize: 150,
      },
    };

    expect(() =>
      analyzeQualitativeQuantitativeDataIntegration(invalidData3)
    ).toThrow(/データ形式/);

    // Act & Assert 4: 定量データが NaN の場合
    const invalidData4 = {
      ...qualitativeData,
      quantitativeData: {
        ...validQuantitativeData,
        improvementPriority: NaN,
      },
    };

    expect(() =>
      analyzeQualitativeQuantitativeDataIntegration(invalidData4)
    ).toThrow(/データ形式/);

    // Act & Assert 5: 定量データが boolean の場合
    const invalidData5 = {
      ...qualitativeData,
      quantitativeData: {
        ...validQuantitativeData,
        sampleSize: true,
      },
    };

    expect(() =>
      analyzeQualitativeQuantitativeDataIntegration(invalidData5)
    ).toThrow(/データ形式/);

    // Act & Assert 6: 正常なデータの場合、エラーが発生しない
    const validData = {
      ...qualitativeData,
      quantitativeData: validQuantitativeData,
    };

    const result = analyzeQualitativeQuantitativeDataIntegration(validData);

    expect(result).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.painPriorityMatrix).toBeDefined();
    expect(Array.isArray(result.painPriorityMatrix.items)).toBe(true);
    expect(result.painPriorityMatrix.items.length).toBeGreaterThan(0);
    expect(result.painPriorityMatrix.items[0]).toHaveProperty('painFactor');
    expect(result.painPriorityMatrix.items[0]).toHaveProperty('frequency');
    expect(result.painPriorityMatrix.items[0]).toHaveProperty('impact');
    expect(result.painPriorityMatrix.items[0]).toHaveProperty('priorityScore');
    expect(typeof result.painPriorityMatrix.items[0].frequency).toBe('number');
    expect(typeof result.painPriorityMatrix.items[0].impact).toBe('number');
    expect(typeof result.painPriorityMatrix.items[0].priorityScore).toBe('number');
  });
});