import { validateUserPainDataQuality } from '../../src/logic/it-1-br-8-2-2-1';

describe('ユーザーペイン定量化データ品質検証機能', () => {
  // SCEN-389
  test('調理時間短縮度が0%ちょうどの境界値の場合、正常データとして保持する', () => {
    const testData = {
      userId: 'user_001',
      segmentId: 'segment_husband_30s',
      cookingTimeGoalMinutes: 30,
      cookingTimeActualMinutes: 30,
      cookingTimeReductionPercent: 0,
      mealGenerationSuccessRate: 85,
      userSatisfactionScore: 4.2,
      timestamp: '2024-01-15T11:00:00Z',
      dataQualityFlags: [] as string[]
    };

    const result = validateUserPainDataQuality(testData);

    expect(result.isValid).toBe(true);
    expect(result.hasError).toBe(false);
    expect(result.cookingTimeReductionPercent).toBe(0);
    expect(result.qualityWarnings).toEqual([]);
    expect(result.statusCode).toBe('DATA_VALID');
    expect(result.isPersisted).toBe(true);
    expect(result.dataQualityCheckPassed).toBe(true);
  });
});