import { calculatePriorityScore } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-712
  test('[error] 優先度スコアリング機能 - 優先度付け基準が定義されていない状態で優先度スコアリングが実行されたとき、エラーが発生する', () => {
    const improvementProposals = [
      {
        proposal_id: 'PROP_001',
        proposal_name: 'アルゴリズム修正：栄養バランス向上',
        business_value: 8,
        technical_difficulty: 6,
        user_impact: 7,
      },
      {
        proposal_id: 'PROP_002',
        proposal_name: 'パラメータ調整：調理時間予測精度向上',
        business_value: 6,
        technical_difficulty: 3,
        user_impact: 5,
      },
    ];

    const prioritization_criteria = null;

    expect(() =>
      calculatePriorityScore(improvementProposals, prioritization_criteria)
    ).toThrow(/優先度付け基準/);
  });
});