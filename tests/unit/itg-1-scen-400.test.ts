import { calculateFeatureUsageFrequency } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-400
  test('利用ログが存在しない機能の使用頻度を求めた場合、ゼロが正しく返される', () => {
    const userId = 'user-001';
    const featureName = '栄養計算機能';
    const analysisStartDate = new Date('2024-01-01T00:00:00Z');
    const analysisEndDate = new Date('2024-01-31T23:59:59Z');

    const usageFrequency = calculateFeatureUsageFrequency({
      userId,
      featureName,
      startDate: analysisStartDate,
      endDate: analysisEndDate
    });

    expect(usageFrequency).toBe(0);
    expect(typeof usageFrequency).toBe('number');
    expect(usageFrequency).not.toBeNull();
    expect(usageFrequency).not.toBeUndefined();
  });
});