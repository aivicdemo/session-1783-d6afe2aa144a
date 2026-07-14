import { generateImprovementProposal } from '../../src/logic/it-7-2-1';

describe('改善提案書生成機能', () => {
  // SCEN-721
  test('優先度スコアが不足した状態で改善提案書生成を実行したときエラーが発生する', () => {
    const improvementProposalInput = {
      title: 'アルゴリズム精度向上案',
      description: '外部要因データの相関分析を強化し、予測精度を向上させる提案',
      priorityScore: null,
      targetSystem: '献立生成アルゴリズム',
      expectedEffect: '予測精度5%以上向上',
      implementationDifficulty: 3,
      userImpactScore: 8,
    };

    expect(() => generateImprovementProposal(improvementProposalInput)).toThrow(/優先度スコア/);
  });
});