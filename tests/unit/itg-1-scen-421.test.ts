import { aggregateMealEvaluationData } from '../../src/logic/it-2';

describe('家族成員の食事評価データ集約機能', () => {
  test('SCEN-421: 食事評価データが存在しない場合、空の集約データセットが出力される', async () => {
    const familyMemberId = 'family-001';
    const mealDate = '2024-01-15';

    const result = await aggregateMealEvaluationData({
      familyMemberId,
      mealDate,
      evaluationRecords: [],
    });

    expect(result).toEqual({
      status: 200,
      data: {
        aggregatedRecords: [],
        totalCount: 0,
        averageSatisfactionScore: null,
        averageCompletionRate: null,
        requestsList: [],
      },
      message: null,
      error: null,
    });

    expect(Array.isArray(result.data.aggregatedRecords)).toBe(true);
    expect(result.data.aggregatedRecords.length).toBe(0);
    expect(result.data.totalCount).toBe(0);
    expect(result.data.averageSatisfactionScore).toBeNull();
    expect(result.data.averageCompletionRate).toBeNull();
    expect(Array.isArray(result.data.requestsList)).toBe(true);
    expect(result.data.requestsList.length).toBe(0);
    expect(result.error).toBeNull();
  });
});