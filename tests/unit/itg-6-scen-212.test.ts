import { calculateImprovementPriorityScore } from '../../src/logic/it-8-1-1-1';

describe('改善課題優先度スコアリング機能', () => {
  test('SCEN-212: 総合優先度スコアが3軸スコアから正確に計算され、課題が適切に優先順位付けされる', () => {
    // テストデータ準備：複数の改善課題（各課題に緊急度、重要度、実現可能性スコアを設定）
    const improvement_issues = [
      {
        issue_id: 'ISSUE_001',
        issue_name: '栄養バランス改善ロジック',
        urgency_score: 8,
        importance_score: 7,
        feasibility_score: 6,
      },
      {
        issue_id: 'ISSUE_002',
        issue_name: '家族好み反映精度向上',
        urgency_score: 5,
        importance_score: 9,
        feasibility_score: 8,
      },
      {
        issue_id: 'ISSUE_003',
        issue_name: '調理時間短縮アルゴリズム',
        urgency_score: 9,
        importance_score: 5,
        feasibility_score: 4,
      },
      {
        issue_id: 'ISSUE_004',
        issue_name: '食材制限処理最適化',
        urgency_score: 7,
        importance_score: 7,
        feasibility_score: 7,
      },
    ];

    // 改善課題優先度スコアリング機能を実行
    const result = calculateImprovementPriorityScore(improvement_issues);

    // 第1課題のスコアリング計算結果を検証
    // 総合優先度スコア = (緊急度 * 0.4) + (重要度 * 0.35) + (実現可能性 * 0.25)
    // ISSUE_001: (8 * 0.4) + (7 * 0.35) + (6 * 0.25) = 3.2 + 2.45 + 1.5 = 7.15
    const issue_001_result = result.find((item) => item.issue_id === 'ISSUE_001');
    expect(issue_001_result).toBeDefined();
    expect(issue_001_result?.overall_priority_score).toBe(7.15);

    // 第2課題のスコアリング計算結果を検証
    // ISSUE_002: (5 * 0.4) + (9 * 0.35) + (8 * 0.25) = 2.0 + 3.15 + 2.0 = 7.15
    const issue_002_result = result.find((item) => item.issue_id === 'ISSUE_002');
    expect(issue_002_result).toBeDefined();
    expect(issue_002_result?.overall_priority_score).toBe(7.15);

    // 第3課題のスコアリング計算結果を検証
    // ISSUE_003: (9 * 0.4) + (5 * 0.35) + (4 * 0.25) = 3.6 + 1.75 + 1.0 = 6.35
    const issue_003_result = result.find((item) => item.issue_id === 'ISSUE_003');
    expect(issue_003_result).toBeDefined();
    expect(issue_003_result?.overall_priority_score).toBe(6.35);

    // 第4課題のスコアリング計算結果を検証
    // ISSUE_004: (7 * 0.4) + (7 * 0.35) + (7 * 0.25) = 2.8 + 2.45 + 1.75 = 7.0
    const issue_004_result = result.find((item) => item.issue_id === 'ISSUE_004');
    expect(issue_004_result).toBeDefined();
    expect(issue_004_result?.overall_priority_score).toBe(7.0);

    // 全課題の総合優先度スコアを比較し、降順でソート
    // 期待される順序：ISSUE_001=7.15, ISSUE_002=7.15, ISSUE_004=7.0, ISSUE_003=6.35
    expect(result[0].overall_priority_score).toBeGreaterThanOrEqual(result[1].overall_priority_score);
    expect(result[1].overall_priority_score).toBeGreaterThanOrEqual(result[2].overall_priority_score);
    expect(result[2].overall_priority_score).toBeGreaterThanOrEqual(result[3].overall_priority_score);

    // 優先順位付けされた課題リストが期待される順序と一致していることを検証
    expect(result.length).toBe(4);
    expect(result[0].issue_id).toBe('ISSUE_001');
    expect(result[1].issue_id).toBe('ISSUE_002');
    expect(result[2].issue_id).toBe('ISSUE_004');
    expect(result[3].issue_id).toBe('ISSUE_003');

    // 境界値テスト：スコアが同一の課題が同じ優先順位に分類されることを確認
    // ISSUE_001と ISSUE_002は両者ともスコア7.15なので、同一グループに分類
    const group_1 = result.filter(
      (item) => item.overall_priority_score === 7.15
    );
    expect(group_1.length).toBe(2);
    expect(group_1.map((item) => item.issue_id)).toContain('ISSUE_001');
    expect(group_1.map((item) => item.issue_id)).toContain('ISSUE_002');

    // 計算結果がJSON形式で正しく出力されていることを検証
    const json_output = JSON.stringify(result);
    const parsed_result = JSON.parse(json_output);
    expect(parsed_result).toEqual(result);
    expect(parsed_result[0]).toHaveProperty('issue_id');
    expect(parsed_result[0]).toHaveProperty('issue_name');
    expect(parsed_result[0]).toHaveProperty('urgency_score');
    expect(parsed_result[0]).toHaveProperty('importance_score');
    expect(parsed_result[0]).toHaveProperty('feasibility_score');
    expect(parsed_result[0]).toHaveProperty('overall_priority_score');
    expect(parsed_result[0]).toHaveProperty('priority_rank');

    // 優先度ランクの検証（同一スコアは同一ランクに分類）
    expect(parsed_result[0].priority_rank).toBe(1);
    expect(parsed_result[1].priority_rank).toBe(1);
    expect(parsed_result[2].priority_rank).toBe(2);
    expect(parsed_result[3].priority_rank).toBe(3);

    // 各課題のスコア成分が入力値と一致していることを確認
    expect(issue_001_result?.urgency_score).toBe(8);
    expect(issue_001_result?.importance_score).toBe(7);
    expect(issue_001_result?.feasibility_score).toBe(6);
  });
});