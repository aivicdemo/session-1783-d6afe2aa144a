import { categorizeAndAggregateImprovementIssues } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-705: [normal] 改善課題統合・重複排除機能 - 関連性の高い複数の改善課題が、類似キーワードにより関連課題として統合される
  test('複数の改善課題が類似キーワードにより正しく統合される', () => {
    const input_issues = [
      {
        issue_id: 'ISS-001',
        issue_title: 'ログイン処理の高速化',
        keywords: ['ログイン', 'パフォーマンス', '高速化'],
        description: 'ユーザーのログイン時間を短縮する',
      },
      {
        issue_id: 'ISS-002',
        issue_title: '認証機能のレスポンス改善',
        keywords: ['認証', 'パフォーマンス', 'レスポンス改善'],
        description: '認証処理のレスポンス時間を改善する',
      },
      {
        issue_id: 'ISS-003',
        issue_title: 'ユーザー認証の最適化',
        keywords: ['ログイン', '認証', '最適化'],
        description: '認証フローを最適化する',
      },
      {
        issue_id: 'ISS-004',
        issue_title: 'データベース接続プール管理',
        keywords: ['データベース', 'パフォーマンス', '接続管理'],
        description: 'DB接続プールを最適化する',
      },
    ];

    const result = categorizeAndAggregateImprovementIssues(input_issues);

    // グループ数の検証：関連キーワードにより複数グループに分類される
    expect(result.groups.length).toBe(2);

    // グループ1：認証・ログイン関連（ISS-001, ISS-002, ISS-003）
    const group1 = result.groups[0];
    expect(group1.parent_issue_id).toBe('ISS-001');
    expect(group1.parent_issue_title).toBe('ログイン処理の高速化');
    expect(group1.child_issues.length).toBe(2);
    expect(group1.child_issues.map((child: any) => child.issue_id)).toEqual(['ISS-002', 'ISS-003']);
    expect(group1.common_keywords).toContain('ログイン');
    expect(group1.common_keywords).toContain('認証');

    // グループ2：データベース関連（ISS-004）
    const group2 = result.groups[1];
    expect(group2.parent_issue_id).toBe('ISS-004');
    expect(group2.parent_issue_title).toBe('データベース接続プール管理');
    expect(group2.child_issues.length).toBe(0);
    expect(group2.common_keywords).toContain('データベース');

    // 重複排除の検証：全課題がいずれかのグループに属する
    const all_assigned_issues = new Set<string>();
    result.groups.forEach((group: any) => {
      all_assigned_issues.add(group.parent_issue_id);
      group.child_issues.forEach((child: any) => {
        all_assigned_issues.add(child.issue_id);
      });
    });
    expect(all_assigned_issues.size).toBe(4);

    // グループの区別と統合状態の検証
    expect(result.groups[0].group_id).not.toBe(result.groups[1].group_id);
    expect(result.groups[0].similarity_score).toBeGreaterThanOrEqual(0.7);
    expect(result.groups[1].similarity_score).toBeGreaterThanOrEqual(0.5);

    // 統合フラグと統合日時の検証
    result.groups.forEach((group: any) => {
      expect(group.is_merged).toBe(true);
      expect(group.merged_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });

    // 関連キーワードマッピング結果の検証
    expect(result.keyword_mapping.length).toBeGreaterThan(0);
    const mapping_keywords = result.keyword_mapping.map((m: any) => m.keyword);
    expect(mapping_keywords).toContain('ログイン');
    expect(mapping_keywords).toContain('認証');
    expect(mapping_keywords).toContain('パフォーマンス');

    // 各関連キーワードが複数の課題にマッピングされていることを確認
    const login_mapping = result.keyword_mapping.find((m: any) => m.keyword === 'ログイン');
    expect(login_mapping.mapped_issue_ids.length).toBeGreaterThanOrEqual(2);
  });
});