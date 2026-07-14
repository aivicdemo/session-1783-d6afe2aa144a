import { evaluateImprovementEffect } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善効果判定', () => {
  // SCEN-877
  test('改善後の成功率が最小閾値未満の場合に改善失敗と判定される', () => {
    const input = {
      preImprovementSuccessRate: 80,
      postImprovementSuccessRate: 69,
      minimumThreshold: 70,
      evaluationTimestamp: '2024-01-15T11:00:00Z'
    };

    const result = evaluateImprovementEffect(input);

    expect(result.status).toBe('失敗');
    expect(result.isImproved).toBe(false);
    expect(result.errorMessage).toMatch(/改善失敗/);
    expect(result.errorMessage).toMatch(/最小閾値/);
    expect(result.effectDifference).toBe(-11);
    expect(result.meetsMinimumThreshold).toBe(false);
  });
});