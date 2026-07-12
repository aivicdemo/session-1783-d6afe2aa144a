import { calculateAlgorithmImprovementEffect } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-606
  test('改善効果が0%（改善なし）の境界値で正常に判定される', () => {
    const preAlgorithmScore = 100;
    const postAlgorithmScore = 100;

    const result = calculateAlgorithmImprovementEffect({
      preAlgorithmScore,
      postAlgorithmScore,
    });

    expect(result.improvementPercentage).toBe(0);
    expect(result.status).toBe('改善なし');
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBeNull();
  });
});