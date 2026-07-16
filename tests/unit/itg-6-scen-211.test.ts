import { calculateImprovementScores } from '../../src/logic/it-8-1-1-1';

describe('改善課題優先度スコアリング機能 - ビジネス価値・技術難度・ユーザーインパクトの3軸スコア算出', () => {
  // SCEN-211
  test('改善課題優先度スコアリング機能 - ビジネス価値・技術難度・ユーザーインパクトの3軸スコアが正確に算出される', () => {
    // テスト用の改善課題データを準備
    const improvement_issues = [
      {
        issue_id: 'ISSUE-001',
        business_value_input: 8,
        technical_difficulty_input: 3,
        user_impact_input: 9,
      },
      {
        issue_id: 'ISSUE-002',
        business_value_input: 5,
        technical_difficulty_input: 7,
        user_impact_input: 4,
      },
      {
        issue_id: 'ISSUE-003',
        business_value_input: 10,
        technical_difficulty_input: 10,
        user_impact_input: 10,
      },
      {
        issue_id: 'ISSUE-004',
        business_value_input: 1,
        technical_difficulty_input: 1,
        user_impact_input: 1,
      },
      {
        issue_id: 'ISSUE-005',
        business_value_input: 0,
        technical_difficulty_input: 0,
        user_impact_input: 0,
      },
    ];

    // 複数の改善課題に対して3軸スコアを一括算出
    const result = calculateImprovementScores(improvement_issues);

    // ISSUE-001の期待値を検証
    // ビジネス価値スコア = business_value_input * 10 = 8 * 10 = 80
    // 技術難度スコア = (10 - technical_difficulty_input) * 10 = (10 - 3) * 10 = 70
    // ユーザーインパクトスコア = user_impact_input * 10 = 9 * 10 = 90
    expect(result[0].issue_id).toBe('ISSUE-001');
    expect(result[0].business_value_score).toBe(80);
    expect(result[0].technical_difficulty_score).toBe(70);
    expect(result[0].user_impact_score).toBe(90);
    expect(result[0].total_priority_score).toBe(80 * 0.4 + 70 * 0.3 + 90 * 0.3); // 32 + 21 + 27 = 80

    // ISSUE-002の期待値を検証
    // ビジネス価値スコア = 5 * 10 = 50
    // 技術難度スコア = (10 - 7) * 10 = 30
    // ユーザーインパクトスコア = 4 * 10 = 40
    expect(result[1].issue_id).toBe('ISSUE-002');
    expect(result[1].business_value_score).toBe(50);
    expect(result[1].technical_difficulty_score).toBe(30);
    expect(result[1].user_impact_score).toBe(40);
    expect(result[1].total_priority_score).toBe(50 * 0.4 + 30 * 0.3 + 40 * 0.3); // 20 + 9 + 12 = 41

    // ISSUE-003の期待値を検証（最大値）
    // ビジネス価値スコア = 10 * 10 = 100
    // 技術難度スコア = (10 - 10) * 10 = 0
    // ユーザーインパクトスコア = 10 * 10 = 100
    expect(result[2].issue_id).toBe('ISSUE-003');
    expect(result[2].business_value_score).toBe(100);
    expect(result[2].technical_difficulty_score).toBe(0);
    expect(result[2].user_impact_score).toBe(100);
    expect(result[2].total_priority_score).toBe(100 * 0.4 + 0 * 0.3 + 100 * 0.3); // 40 + 0 + 30 = 70

    // ISSUE-004の期待値を検証（最小値）
    // ビジネス価値スコア = 1 * 10 = 10
    // 技術難度スコア = (10 - 1) * 10 = 90
    // ユーザーインパクトスコア = 1 * 10 = 10
    expect(result[3].issue_id).toBe('ISSUE-004');
    expect(result[3].business_value_score).toBe(10);
    expect(result[3].technical_difficulty_score).toBe(90);
    expect(result[3].user_impact_score).toBe(10);
    expect(result[3].total_priority_score).toBe(10 * 0.4 + 90 * 0.3 + 10 * 0.3); // 4 + 27 + 3 = 34

    // ISSUE-005の期待値を検証（0値）
    // ビジネス価値スコア = 0 * 10 = 0
    // 技術難度スコア = (10 - 0) * 10 = 100
    // ユーザーインパクトスコア = 0 * 10 = 0
    expect(result[4].issue_id).toBe('ISSUE-005');
    expect(result[4].business_value_score).toBe(0);
    expect(result[4].technical_difficulty_score).toBe(100);
    expect(result[4].user_impact_score).toBe(0);
    expect(result[4].total_priority_score).toBe(0 * 0.4 + 100 * 0.3 + 0 * 0.3); // 0 + 30 + 0 = 30

    // 丸め処理のテスト（小数点以下を正確に丸める）
    const precision_test_issue = [
      {
        issue_id: 'ISSUE-PRECISION',
        business_value_input: 3,
        technical_difficulty_input: 4,
        user_impact_input: 7,
      },
    ];
    const precision_result = calculateImprovementScores(precision_test_issue);
    // ビジネス価値スコア = 3 * 10 = 30
    // 技術難度スコア = (10 - 4) * 10 = 60
    // ユーザーインパクトスコア = 7 * 10 = 70
    // 総合優先度スコア = 30 * 0.4 + 60 * 0.3 + 70 * 0.3 = 12 + 18 + 21 = 51
    expect(precision_result[0].total_priority_score).toBe(51);

    // すべての改善課題について3軸の計算値が期待値と完全に一致することを確認
    expect(result.length).toBe(5);
    expect(result.every((r: any) => 
      typeof r.business_value_score === 'number' &&
      typeof r.technical_difficulty_score === 'number' &&
      typeof r.user_impact_score === 'number' &&
      typeof r.total_priority_score === 'number'
    )).toBe(true);

    // スコアが有効な範囲内（0～100）にあることを確認
    expect(result.every((r: any) => 
      r.business_value_score >= 0 && r.business_value_score <= 100 &&
      r.technical_difficulty_score >= 0 && r.technical_difficulty_score <= 100 &&
      r.user_impact_score >= 0 && r.user_impact_score <= 100
    )).toBe(true);

    // 総合優先度スコアが0～100の範囲内にあることを確認
    expect(result.every((r: any) => 
      r.total_priority_score >= 0 && r.total_priority_score <= 100
    )).toBe(true);
  });
});