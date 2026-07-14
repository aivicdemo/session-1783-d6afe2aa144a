import { consolidateImprovementIssues } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-704
  test('[normal] 改善課題統合・重複排除機能 - 完全に同一の改善課題が複数存在する場合、重複を排除して1件に統合される', () => {
    // テストデータ: 完全に同一の改善課題3件を準備
    const identicalIssue_1 = {
      id: 'issue_001',
      title: '栄養バランス算出ロジックの改善',
      description: '現在の栄養基準値が実際のユーザー食事記録と乖離しており、改善が必要',
      priority: 'high',
      category: 'nutrition_balance',
      status: 'pending_review',
      relatedHistory: [
        { timestamp: '2024-01-10T08:00:00Z', action: 'created', userId: 'user_001' },
        { timestamp: '2024-01-11T09:30:00Z', action: 'commented', userId: 'user_002' },
      ],
      tags: ['nutrition', 'algorithm', 'backend'],
    };

    const identicalIssue_2 = {
      id: 'issue_002',
      title: '栄養バランス算出ロジックの改善',
      description: '現在の栄養基準値が実際のユーザー食事記録と乖離しており、改善が必要',
      priority: 'high',
      category: 'nutrition_balance',
      status: 'pending_review',
      relatedHistory: [
        { timestamp: '2024-01-12T10:15:00Z', action: 'commented', userId: 'user_003' },
      ],
      tags: ['nutrition', 'data_quality'],
    };

    const identicalIssue_3 = {
      id: 'issue_003',
      title: '栄養バランス算出ロジックの改善',
      description: '現在の栄養基準値が実際のユーザー食事記録と乖離しており、改善が必要',
      priority: 'high',
      category: 'nutrition_balance',
      status: 'pending_review',
      relatedHistory: [
        { timestamp: '2024-01-13T14:45:00Z', action: 'reviewed', userId: 'user_004' },
      ],
      tags: ['nutrition', 'testing'],
    };

    const inputIssues = [identicalIssue_1, identicalIssue_2, identicalIssue_3];

    // 改善課題統合・重複排除機能を実行
    const result = consolidateImprovementIssues(inputIssues);

    // 期待結果: 3件が1件に統合される
    expect(result.consolidatedIssues.length).toBe(1);

    // 統合後の課題は元の情報を保持
    const consolidatedIssue = result.consolidatedIssues[0];
    expect(consolidatedIssue.title).toBe('栄養バランス算出ロジックの改善');
    expect(consolidatedIssue.description).toBe(
      '現在の栄養基準値が実際のユーザー食事記録と乖離しており、改善が必要'
    );
    expect(consolidatedIssue.priority).toBe('high');
    expect(consolidatedIssue.category).toBe('nutrition_balance');
    expect(consolidatedIssue.status).toBe('pending_review');

    // 統合元の複数課題に関連付けられていた履歴がマージされている
    expect(consolidatedIssue.relatedHistory.length).toBe(4);
    expect(consolidatedIssue.relatedHistory).toContainEqual({
      timestamp: '2024-01-10T08:00:00Z',
      action: 'created',
      userId: 'user_001',
    });
    expect(consolidatedIssue.relatedHistory).toContainEqual({
      timestamp: '2024-01-11T09:30:00Z',
      action: 'commented',
      userId: 'user_002',
    });
    expect(consolidatedIssue.relatedHistory).toContainEqual({
      timestamp: '2024-01-12T10:15:00Z',
      action: 'commented',
      userId: 'user_003',
    });
    expect(consolidatedIssue.relatedHistory).toContainEqual({
      timestamp: '2024-01-13T14:45:00Z',
      action: 'reviewed',
      userId: 'user_004',
    });

    // 統合元の複数課題に関連付けられていたタグが統合・重複排除される
    expect(consolidatedIssue.tags.length).toBe(4);
    expect(consolidatedIssue.tags).toContain('nutrition');
    expect(consolidatedIssue.tags).toContain('algorithm');
    expect(consolidatedIssue.tags).toContain('backend');
    expect(consolidatedIssue.tags).toContain('data_quality');
    expect(consolidatedIssue.tags).toContain('testing');

    // 統合元の3つの課題IDが記録される
    expect(result.mergedSourceIds.length).toBe(3);
    expect(result.mergedSourceIds).toContain('issue_001');
    expect(result.mergedSourceIds).toContain('issue_002');
    expect(result.mergedSourceIds).toContain('issue_003');

    // 統合処理の成功を示すメタデータ
    expect(result.consolidationSummary.totalInputIssues).toBe(3);
    expect(result.consolidationSummary.outputIssueCount).toBe(1);
    expect(result.consolidationSummary.mergedCount).toBe(1);
  });
});