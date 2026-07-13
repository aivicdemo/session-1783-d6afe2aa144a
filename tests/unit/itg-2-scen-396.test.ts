import { generatePeriodicNotifications } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-396
  test('定期通知生成機能 - 優先度付けされた改善提案が開発チームに定期通知される', () => {
    // 前提: 栄養士が改善提案を優先度付けして入力済み、通知対象を「開発チーム」に設定済み
    const improvementProposals = [
      {
        proposalId: 'prop-001',
        title: 'カルシウム摂取量の基準値引き上げ',
        description: 'ユーザーの平均カルシウム摂取量が基準値の72%に留まっており、改善が必要',
        businessValue: 8,
        technicalDifficulty: 4,
        userImpact: 9,
        priorityScore: 8.33,
        priorityRank: 'high',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        proposalId: 'prop-002',
        title: '食物繊維摂取パターンの最適化',
        description: '高齢者層の食物繊維摂取が不足傾向。献立パターン調整で改善可能',
        businessValue: 6,
        technicalDifficulty: 5,
        userImpact: 6,
        priorityScore: 5.67,
        priorityRank: 'medium',
        createdAt: new Date('2024-01-15T10:30:00Z'),
      },
      {
        proposalId: 'prop-003',
        title: 'ナトリウム削減施策の強化',
        description: '献立生成時にナトリウム含有量を事前検証し、高塩分食材の自動除外ロジックを追加',
        businessValue: 5,
        technicalDifficulty: 6,
        userImpact: 4,
        priorityScore: 5.0,
        priorityRank: 'low',
        createdAt: new Date('2024-01-15T11:00:00Z'),
      },
    ];

    const notificationConfig = {
      targetTeam: 'development',
      scheduleType: 'periodic',
      frequency: 'weekly',
      dayOfWeek: 'monday',
      timeOfDay: '09:00',
      includeProposalDetails: true,
    };

    // 発生条件: 定期通知生成機能を実行し、複数の改善提案を処理する
    const generatedNotification = generatePeriodicNotifications(
      improvementProposals,
      notificationConfig
    );

    // 期待結果: 通知内容が優先度の高い順にソートされている
    expect(generatedNotification.status).toBe('generated');
    expect(generatedNotification.targetTeam).toBe('development');
    expect(generatedNotification.proposalsInNotification).toHaveLength(3);

    // 通知内容が優先度の高い順に整列されていることを確認
    expect(generatedNotification.proposalsInNotification[0].proposalId).toBe('prop-001');
    expect(generatedNotification.proposalsInNotification[0].priorityRank).toBe('high');
    expect(generatedNotification.proposalsInNotification[0].priorityScore).toBe(8.33);

    expect(generatedNotification.proposalsInNotification[1].proposalId).toBe('prop-002');
    expect(generatedNotification.proposalsInNotification[1].priorityRank).toBe('medium');
    expect(generatedNotification.proposalsInNotification[1].priorityScore).toBe(5.67);

    expect(generatedNotification.proposalsInNotification[2].proposalId).toBe('prop-003');
    expect(generatedNotification.proposalsInNotification[2].priorityRank).toBe('low');
    expect(generatedNotification.proposalsInNotification[2].priorityScore).toBe(5.0);

    // 通知ログに配信日時と対象チーム情報が記録されていることを確認
    expect(generatedNotification.notificationLog).toBeDefined();
    expect(generatedNotification.notificationLog.deliveryDateTime).toBeDefined();
    expect(generatedNotification.notificationLog.targetTeam).toBe('development');
    expect(generatedNotification.notificationLog.proposalCount).toBe(3);
    expect(generatedNotification.notificationLog.status).toBe('delivered');

    // 通知スケジュール情報が正確に記録されていることを確認
    expect(generatedNotification.notificationLog.scheduleType).toBe('periodic');
    expect(generatedNotification.notificationLog.frequency).toBe('weekly');
    expect(generatedNotification.notificationLog.dayOfWeek).toBe('monday');
    expect(generatedNotification.notificationLog.timeOfDay).toBe('09:00');

    // 通知内容にすべての改善提案詳細が含まれていることを確認
    expect(generatedNotification.proposalsInNotification[0].title).toBe('カルシウム摂取量の基準値引き上げ');
    expect(generatedNotification.proposalsInNotification[0].description).toContain('カルシウム摂取量が基準値の72%');
    expect(generatedNotification.proposalsInNotification[0].businessValue).toBe(8);
    expect(generatedNotification.proposalsInNotification[0].technicalDifficulty).toBe(4);
    expect(generatedNotification.proposalsInNotification[0].userImpact).toBe(9);

    // 配信記録が正確に保存されていることを確認（SLA：5営業日以内）
    expect(generatedNotification.notificationLog.slaCompliance).toBe(true);
    expect(generatedNotification.notificationLog.daysUntilDeadline).toBeLessThanOrEqual(5);
  });
});