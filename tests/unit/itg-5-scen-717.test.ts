import { calculateCompositeScore } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-717: [error] 総合スコア算出・課題順位付け機能 - 評価基準の確定前にスコア算出を実行したとき、エラーが発生する
  test('評価基準が確定されていない状態でスコア算出を実行すると評価基準確定エラーが発生する', () => {
    const improvement_proposal_id = 'prop_001';
    const business_value_score = null;
    const technical_difficulty_score = null;
    const user_impact_score = null;
    const evaluation_criteria_confirmed = false;

    expect(() =>
      calculateCompositeScore({
        improvement_proposal_id,
        business_value_score,
        technical_difficulty_score,
        user_impact_score,
        evaluation_criteria_confirmed,
      })
    ).toThrow(/評価基準/);
  });
});