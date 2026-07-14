import { evaluateTechnicalFeasibility } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-729: [error] 技術実現性評価機能 - 必須パラメータ（実装工数・技術難度）が不足している提案の評価は失敗する
  test('必須パラメータ不足時にバリデーションエラーが発生する', () => {
    // 実装工数を null として渡す
    const proposalWithMissingEffort = {
      proposal_id: 'PROP-001',
      implementation_effort: null,
      technical_difficulty: 3,
      business_value: 8,
      user_impact: 7,
    };

    expect(() =>
      evaluateTechnicalFeasibility(proposalWithMissingEffort)
    ).toThrow(/実装工数/);

    // 技術難度を null として渡す
    const proposalWithMissingDifficulty = {
      proposal_id: 'PROP-002',
      implementation_effort: 5,
      technical_difficulty: null,
      business_value: 8,
      user_impact: 7,
    };

    expect(() =>
      evaluateTechnicalFeasibility(proposalWithMissingDifficulty)
    ).toThrow(/技術難度/);

    // 両方とも null として渡す
    const proposalWithBothMissing = {
      proposal_id: 'PROP-003',
      implementation_effort: null,
      technical_difficulty: null,
      business_value: 8,
      user_impact: 7,
    };

    expect(() =>
      evaluateTechnicalFeasibility(proposalWithBothMissing)
    ).toThrow(/実装工数|技術難度/);

    // 実装工数が undefined として渡す
    const proposalWithUndefinedEffort = {
      proposal_id: 'PROP-004',
      implementation_effort: undefined,
      technical_difficulty: 3,
      business_value: 8,
      user_impact: 7,
    };

    expect(() =>
      evaluateTechnicalFeasibility(proposalWithUndefinedEffort)
    ).toThrow(/実装工数/);

    // 技術難度が空文字列として渡す
    const proposalWithEmptyDifficulty = {
      proposal_id: 'PROP-005',
      implementation_effort: 5,
      technical_difficulty: '',
      business_value: 8,
      user_impact: 7,
    };

    expect(() =>
      evaluateTechnicalFeasibility(proposalWithEmptyDifficulty)
    ).toThrow(/技術難度/);
  });
});