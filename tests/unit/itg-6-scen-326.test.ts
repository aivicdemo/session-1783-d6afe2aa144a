import { validateCompetitiveAnalysisScore } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-326: [error] 競合アプリとの差別化軸検証機能 - 自社対応度スコアが0～100範囲外の場合にエラーが発生する
  test('自社対応度スコアが-1の場合、エラーが発生する', () => {
    const invalidInput = {
      pain_factor_id: 'pf_001',
      pain_factor_name: '食材制限',
      competitor_app_score: 75,
      self_app_score: -1,
      analysis_date: '2024-01-15'
    };
    expect(() => validateCompetitiveAnalysisScore(invalidInput)).toThrow(/自社対応度スコア/);
  });

  test('自社対応度スコアが101の場合、エラーが発生する', () => {
    const invalidInput = {
      pain_factor_id: 'pf_002',
      pain_factor_name: '調理時間制限',
      competitor_app_score: 60,
      self_app_score: 101,
      analysis_date: '2024-01-15'
    };
    expect(() => validateCompetitiveAnalysisScore(invalidInput)).toThrow(/自社対応度スコア/);
  });

  test('自社対応度スコアが0の場合、エラーが発生しない', () => {
    const validInput = {
      pain_factor_id: 'pf_003',
      pain_factor_name: '予算制約',
      competitor_app_score: 50,
      self_app_score: 0,
      analysis_date: '2024-01-15'
    };
    const result = validateCompetitiveAnalysisScore(validInput);
    expect(result).toEqual({
      is_valid: true,
      gap_score: 50,
      differentiation_possible: false
    });
  });

  test('自社対応度スコアが100の場合、エラーが発生しない', () => {
    const validInput = {
      pain_factor_id: 'pf_004',
      pain_factor_name: '食材制限',
      competitor_app_score: 60,
      self_app_score: 100,
      analysis_date: '2024-01-15'
    };
    const result = validateCompetitiveAnalysisScore(validInput);
    expect(result).toEqual({
      is_valid: true,
      gap_score: -40,
      differentiation_possible: false
    });
  });

  test('自社対応度スコアが50で競合アプリスコアが20の場合、ギャップスコアが30以上となり差別化可能と判定される', () => {
    const validInput = {
      pain_factor_id: 'pf_005',
      pain_factor_name: '調理時間制限',
      competitor_app_score: 20,
      self_app_score: 50,
      analysis_date: '2024-01-15'
    };
    const result = validateCompetitiveAnalysisScore(validInput);
    expect(result).toEqual({
      is_valid: true,
      gap_score: 30,
      differentiation_possible: true
    });
  });

  test('自社対応度スコアが45で競合アプリスコアが20の場合、ギャップスコアが25未満となり差別化不可と判定される', () => {
    const validInput = {
      pain_factor_id: 'pf_006',
      pain_factor_name: '予算制約',
      competitor_app_score: 20,
      self_app_score: 45,
      analysis_date: '2024-01-15'
    };
    const result = validateCompetitiveAnalysisScore(validInput);
    expect(result).toEqual({
      is_valid: true,
      gap_score: 25,
      differentiation_possible: false
    });
  });

  test('自社対応度スコアが80で競合アプリスコアが40の場合、ギャップスコアが40以上となり差別化可能と判定される', () => {
    const validInput = {
      pain_factor_id: 'pf_007',
      pain_factor_name: '食材制限',
      competitor_app_score: 40,
      self_app_score: 80,
      analysis_date: '2024-01-15'
    };
    const result = validateCompetitiveAnalysisScore(validInput);
    expect(result).toEqual({
      is_valid: true,
      gap_score: 40,
      differentiation_possible: true
    });
  });
});