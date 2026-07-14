import { calculateExternalFactorTrustScore } from '../../src/logic/it-7-2-1';

describe('外部要因データ信頼度スコア付与・採用判定機能', () => {
  // SCEN-806
  test('メタデータが不完全な場合、デフォルトスコア(50点)が適用される', () => {
    // 必須メタデータが完全な場合のテストデータ
    const completeMetadata = {
      dataSource: 'weather-api',
      lastUpdatedAt: new Date('2024-01-15T10:00:00Z'),
      sampleCount: 1000,
      dataQuality: 'verified',
    };

    // 必須メタデータのうち dataSource を欠落させたテストデータ
    const incompleteMetadata_1 = {
      lastUpdatedAt: new Date('2024-01-15T10:00:00Z'),
      sampleCount: 1000,
      dataQuality: 'verified',
    };

    // 必須メタデータのうち lastUpdatedAt を欠落させたテストデータ
    const incompleteMetadata_2 = {
      dataSource: 'weather-api',
      sampleCount: 1000,
      dataQuality: 'verified',
    };

    // 必須メタデータのうち sampleCount を欠落させたテストデータ
    const incompleteMetadata_3 = {
      dataSource: 'weather-api',
      lastUpdatedAt: new Date('2024-01-15T10:00:00Z'),
      dataQuality: 'verified',
    };

    // 必須メタデータのうち dataQuality を欠落させたテストデータ
    const incompleteMetadata_4 = {
      dataSource: 'weather-api',
      lastUpdatedAt: new Date('2024-01-15T10:00:00Z'),
      sampleCount: 1000,
    };

    // すべての必須メタデータが null のテストデータ
    const incompleteMetadata_5 = {
      dataSource: null,
      lastUpdatedAt: null,
      sampleCount: null,
      dataQuality: null,
    };

    // メタデータが完全な場合、正常な信頼度スコアが計算される
    const result_complete = calculateExternalFactorTrustScore(completeMetadata);
    expect(result_complete.score).toBeGreaterThanOrEqual(60);
    expect(result_complete.score).toBeLessThanOrEqual(100);
    expect(result_complete.isDefaultApplied).toBe(false);

    // dataSource が欠落している場合、デフォルトスコア(50点)が適用される
    const result_incomplete_1 = calculateExternalFactorTrustScore(incompleteMetadata_1 as any);
    expect(result_incomplete_1.score).toBe(50);
    expect(result_incomplete_1.isDefaultApplied).toBe(true);
    expect(result_incomplete_1.reason).toMatch(/メタデータ不完全/);

    // lastUpdatedAt が欠落している場合、デフォルトスコア(50点)が適用される
    const result_incomplete_2 = calculateExternalFactorTrustScore(incompleteMetadata_2 as any);
    expect(result_incomplete_2.score).toBe(50);
    expect(result_incomplete_2.isDefaultApplied).toBe(true);
    expect(result_incomplete_2.reason).toMatch(/メタデータ不完全/);

    // sampleCount が欠落している場合、デフォルトスコア(50点)が適用される
    const result_incomplete_3 = calculateExternalFactorTrustScore(incompleteMetadata_3 as any);
    expect(result_incomplete_3.score).toBe(50);
    expect(result_incomplete_3.isDefaultApplied).toBe(true);
    expect(result_incomplete_3.reason).toMatch(/メタデータ不完全/);

    // dataQuality が欠落している場合、デフォルトスコア(50点)が適用される
    const result_incomplete_4 = calculateExternalFactorTrustScore(incompleteMetadata_4 as any);
    expect(result_incomplete_4.score).toBe(50);
    expect(result_incomplete_4.isDefaultApplied).toBe(true);
    expect(result_incomplete_4.reason).toMatch(/メタデータ不完全/);

    // すべてのメタデータが null の場合、デフォルトスコア(50点)が適用される
    const result_incomplete_5 = calculateExternalFactorTrustScore(incompleteMetadata_5);
    expect(result_incomplete_5.score).toBe(50);
    expect(result_incomplete_5.isDefaultApplied).toBe(true);
    expect(result_incomplete_5.reason).toMatch(/メタデータ不完全/);

    // すべてのテストケースで、システムが正常に処理を継続できることを確認
    expect(result_incomplete_1).toHaveProperty('score');
    expect(result_incomplete_1).toHaveProperty('isDefaultApplied');
    expect(result_incomplete_1).toHaveProperty('reason');
    expect(result_incomplete_1).toHaveProperty('timestamp');

    expect(result_incomplete_2).toHaveProperty('score');
    expect(result_incomplete_2).toHaveProperty('isDefaultApplied');
    expect(result_incomplete_2).toHaveProperty('reason');
    expect(result_incomplete_2).toHaveProperty('timestamp');

    expect(result_incomplete_3).toHaveProperty('score');
    expect(result_incomplete_3).toHaveProperty('isDefaultApplied');
    expect(result_incomplete_3).toHaveProperty('reason');
    expect(result_incomplete_3).toHaveProperty('timestamp');

    expect(result_incomplete_4).toHaveProperty('score');
    expect(result_incomplete_4).toHaveProperty('isDefaultApplied');
    expect(result_incomplete_4).toHaveProperty('reason');
    expect(result_incomplete_4).toHaveProperty('timestamp');

    expect(result_incomplete_5).toHaveProperty('score');
    expect(result_incomplete_5).toHaveProperty('isDefaultApplied');
    expect(result_incomplete_5).toHaveProperty('reason');
    expect(result_incomplete_5).toHaveProperty('timestamp');
  });
});