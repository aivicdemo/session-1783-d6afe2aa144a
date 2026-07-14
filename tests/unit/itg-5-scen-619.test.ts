import { validateDeploymentImprovementMetrics } from '../../src/logic/it-7-2-1';

describe('IT-7-2-1: デプロイ後の改善度検証機能 - 不完全データ警告', () => {
  // SCEN-619: [error] デプロイ後の改善度検証機能 - 複数指標のうち1つ以上のデータが欠落している場合、不完全データとして警告が返される
  test('複数指標のうち1つ以上が欠落している場合、欠落指標を明示した警告を返す', () => {
    const metricsDataset = {
      processingSpeed: 1250,
      accuracy: 0.92,
      resourceUsageRate: undefined,
      successRate: 0.87,
      userSatisfactionScore: 4.3,
    };

    const result = validateDeploymentImprovementMetrics(metricsDataset);

    expect(result.isValid).toBe(false);
    expect(result.warning).toMatch(/resourceUsageRate/);
    expect(result.missingMetrics).toContain('resourceUsageRate');
    expect(result.processingHalted).toBe(true);
    expect(result.userPrompt).toMatch(/データ補完/);
  });

  test('複数指標が同時に欠落している場合、すべての欠落指標を明示した警告を返す', () => {
    const metricsDataset = {
      processingSpeed: undefined,
      accuracy: undefined,
      resourceUsageRate: 65.4,
      successRate: 0.89,
      userSatisfactionScore: undefined,
    };

    const result = validateDeploymentImprovementMetrics(metricsDataset);

    expect(result.isValid).toBe(false);
    expect(result.warning).toMatch(/processingSpeed/);
    expect(result.warning).toMatch(/accuracy/);
    expect(result.warning).toMatch(/userSatisfactionScore/);
    expect(result.missingMetrics).toEqual(
      expect.arrayContaining(['processingSpeed', 'accuracy', 'userSatisfactionScore'])
    );
    expect(result.missingMetrics.length).toBe(3);
    expect(result.processingHalted).toBe(true);
  });

  test('すべての指標が揃っている場合、検証は正常に完了し警告は返されない', () => {
    const metricsDataset = {
      processingSpeed: 1200,
      accuracy: 0.94,
      resourceUsageRate: 62.5,
      successRate: 0.91,
      userSatisfactionScore: 4.5,
    };

    const result = validateDeploymentImprovementMetrics(metricsDataset);

    expect(result.isValid).toBe(true);
    expect(result.warning).toBe('');
    expect(result.missingMetrics).toEqual([]);
    expect(result.processingHalted).toBe(false);
    expect(result.userPrompt).toBe('');
  });

  test('null 値を含む指標も欠落として検出される', () => {
    const metricsDataset = {
      processingSpeed: 1300,
      accuracy: null,
      resourceUsageRate: 70.2,
      successRate: 0.88,
      userSatisfactionScore: 4.2,
    };

    const result = validateDeploymentImprovementMetrics(metricsDataset);

    expect(result.isValid).toBe(false);
    expect(result.warning).toMatch(/accuracy/);
    expect(result.missingMetrics).toContain('accuracy');
    expect(result.processingHalted).toBe(true);
  });

  test('空文字列を含む指標は欠落として検出される', () => {
    const metricsDataset = {
      processingSpeed: 1150,
      accuracy: 0.93,
      resourceUsageRate: '',
      successRate: 0.90,
      userSatisfactionScore: 4.4,
    };

    const result = validateDeploymentImprovementMetrics(metricsDataset);

    expect(result.isValid).toBe(false);
    expect(result.warning).toMatch(/resourceUsageRate/);
    expect(result.missingMetrics).toContain('resourceUsageRate');
    expect(result.processingHalted).toBe(true);
  });

  test('欠落指標が1つの場合、その指標名が警告メッセージに明確に含まれる', () => {
    const metricsDataset = {
      processingSpeed: 1100,
      accuracy: undefined,
      resourceUsageRate: 68.0,
      successRate: 0.85,
      userSatisfactionScore: 4.1,
    };

    const result = validateDeploymentImprovementMetrics(metricsDataset);

    expect(result.isValid).toBe(false);
    expect(result.warning).toContain('accuracy');
    expect(result.missingMetrics.length).toBe(1);
    expect(result.missingMetrics[0]).toBe('accuracy');
  });
});