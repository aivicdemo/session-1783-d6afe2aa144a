import { validateStatisticalSignificance } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-704: [error] 統計的有意性判定機能 - サンプルサイズが不足している場合に信頼度不足として結果が除外される
  test('サンプルサイズが不足している献立データセットの統計的有意性判定で信頼度不足と判定され除外される', () => {
    const insufficientSampleSize = 25; // n < 30 (最小値未満)
    const mealDataset = Array.from({ length: insufficientSampleSize }, (_, i) => ({
      mealId: `meal_${i + 1}`,
      satisfactionScore: Math.floor(Math.random() * 5) + 1,
      completionRate: Math.random() * 100,
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    }));

    const result = validateStatisticalSignificance({
      datasetSize: insufficientSampleSize,
      mealRecords: mealDataset,
      minimumSampleSize: 30,
    });

    // 戻り値には除外理由を示すエラーステータスが含まれることを確認
    expect(result.isValid).toBe(false);
    expect(result.statusCode).toBe('SAMPLE_SIZE_INSUFFICIENT');
    expect(result.confidenceLevel).toBe(0);
    expect(result.isExcluded).toBe(true);
    expect(result.excludeReason).toMatch(/サンプルサイズ/);

    // 結果が統計分析結果から削除されていることを確認
    expect(result.analysisResults).toEqual([]);
    expect(result.includeInAnalysis).toBe(false);
  });
});