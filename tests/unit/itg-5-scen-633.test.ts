import { calculateAlgorithmImprovementEffect } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果定量比較ダッシュボード', () => {
  // SCEN-633: [edge] 改善効果定量比較機能 - 本番稼働期間が1週間未満の場合、集計が実行されない
  test('本番稼働期間が1週間未満（6日間）の場合、集計が実行されず、エラーメッセージが表示される', () => {
    const productionStartDate = new Date('2024-01-15T00:00:00Z');
    const productionEndDate = new Date('2024-01-21T00:00:00Z');

    const preImprovementMetrics = {
      successRate: 0.75,
      cookingTimeReduction: 15.5,
      satisfactionScore: 3.8,
    };

    const postImprovementMetrics = {
      successRate: 0.82,
      cookingTimeReduction: 22.0,
      satisfactionScore: 4.1,
    };

    const input = {
      productionStartDate,
      productionEndDate,
      preImprovementMetrics,
      postImprovementMetrics,
    };

    expect(() => calculateAlgorithmImprovementEffect(input)).toThrow(/本番稼働期間/);
  });
});