import { detectAndExcludeAnomalies } from '../../src/logic/it-1-br-8-2-2-1';

describe('ユーザーペイン定量化データ品質検証 - 献立生成成功率異常値検出・除外', () => {
  // SCEN-388
  test('献立生成成功率が100%超過またはマイナスのデータを異常値として検出・除外する', () => {
    const testDataWithAnomalies = [
      { segmentId: 'seg_001', recipeGenerationSuccessRate: 105 },
      { segmentId: 'seg_002', recipeGenerationSuccessRate: 150 },
      { segmentId: 'seg_003', recipeGenerationSuccessRate: -5 },
      { segmentId: 'seg_004', recipeGenerationSuccessRate: -10 },
      { segmentId: 'seg_005', recipeGenerationSuccessRate: 45 },
      { segmentId: 'seg_006', recipeGenerationSuccessRate: 78 },
      { segmentId: 'seg_007', recipeGenerationSuccessRate: 0 },
      { segmentId: 'seg_008', recipeGenerationSuccessRate: 100 },
    ];

    const result = detectAndExcludeAnomalies(testDataWithAnomalies);

    expect(result.validData).toEqual([
      { segmentId: 'seg_005', recipeGenerationSuccessRate: 45 },
      { segmentId: 'seg_006', recipeGenerationSuccessRate: 78 },
      { segmentId: 'seg_007', recipeGenerationSuccessRate: 0 },
      { segmentId: 'seg_008', recipeGenerationSuccessRate: 100 },
    ]);

    expect(result.anomalies).toEqual([
      { segmentId: 'seg_001', recipeGenerationSuccessRate: 105, reason: '成功率が100%を超過' },
      { segmentId: 'seg_002', recipeGenerationSuccessRate: 150, reason: '成功率が100%を超過' },
      { segmentId: 'seg_003', recipeGenerationSuccessRate: -5, reason: '成功率がマイナス' },
      { segmentId: 'seg_004', recipeGenerationSuccessRate: -10, reason: '成功率がマイナス' },
    ]);

    expect(result.validDataCount).toBe(4);
    expect(result.anomalyCount).toBe(4);
    expect(result.processCompleted).toBe(true);
    expect(result.hasError).toBe(false);
  });
});