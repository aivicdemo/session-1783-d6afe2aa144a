import { attemptAddProposalToRoadmap } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-740: [error] 開発ロードマップ組み込み機能 - 技術実現性評価の不足により提案がロードマップに組み込まれず、エラーとなる
  test('技術実現性評価が不足している場合、提案はロードマップに組み込まれず、エラーメッセージが表示される', () => {
    const proposalData = {
      title: '栄養バランス改善アルゴリズム',
      description: '家族構成別の栄養基準値を動的に調整し、献立生成精度を向上させる提案',
      businessValue: 85,
      technicalDifficulty: 72,
      userImpact: 78,
      technicalFeasibilityEvaluation: null,
    };

    expect(() => attemptAddProposalToRoadmap(proposalData)).toThrow(/技術実現性評価/);
  });
});