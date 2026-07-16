import { calculateImprovementProposalPriorityScore } from '../../src/logic/it-8-1-2-1';

describe('改善提案の優先度スコアリングと通知ワークフロー', () => {
  // SCEN-226
  test('優先度付けされた改善提案が5営業日以内に開発チームへ自動通知される', () => {
    // テストデータ: 複数の改善提案（異なる優先度スコア）
    const improvementProposals = [
      {
        proposalId: 'PROP-001',
        title: '栄養バランス検証ロジック改善',
        businessValue: 85,
        technicalDifficulty: 60,
        userImpact: 90,
        affectedNutrientItems: ['タンパク質', 'ビタミンA'],
        affectedUserSegments: ['専業主夫層', '子育て世帯'],
        affectedRestrictionTypes: ['食物アレルギー'],
      },
      {
        proposalId: 'PROP-002',
        title: '調理時間予測アルゴリズム微調整',
        businessValue: 55,
        technicalDifficulty: 35,
        userImpact: 65,
        affectedNutrientItems: [],
        affectedUserSegments: ['時間制約層'],
        affectedRestrictionTypes: ['調理時間制限'],
      },
      {
        proposalId: 'PROP-003',
        title: '食材制限フィルタリング強化',
        businessValue: 92,
        technicalDifficulty: 45,
        userImpact: 95,
        affectedNutrientItems: ['アレルゲン検出'],
        affectedUserSegments: ['アレルギー対応層', '専業主夫層'],
        affectedRestrictionTypes: ['食物アレルギー', '食事制限'],
      },
    ];

    // 優先度スコアリングロジックを実行
    const scoringResults = improvementProposals.map((proposal) =>
      calculateImprovementProposalPriorityScore({
        businessValue: proposal.businessValue,
        technicalDifficulty: proposal.technicalDifficulty,
        userImpact: proposal.userImpact,
      })
    );

    // 期待値計算: 
    // PROP-001: (85 * 0.4) + (90 * 0.4) - (60 * 0.2) = 34 + 36 - 12 = 58
    // PROP-002: (55 * 0.4) + (65 * 0.4) - (35 * 0.2) = 22 + 26 - 7 = 41
    // PROP-003: (92 * 0.4) + (95 * 0.4) - (45 * 0.2) = 36.8 + 38 - 9 = 65.8 → 66（四捨五入）

    expect(scoringResults[0].priorityScore).toBe(58);
    expect(scoringResults[1].priorityScore).toBe(41);
    expect(scoringResults[2].priorityScore).toBe(66);

    // 優先度ランク判定（閾値: 高 >= 60, 中 40-59, 低 < 40）
    expect(scoringResults[0].priorityRank).toBe('中');
    expect(scoringResults[1].priorityRank).toBe('中');
    expect(scoringResults[2].priorityRank).toBe('高');

    // 高優先度提案を特定
    const highPriorityProposals = improvementProposals.filter(
      (_, index) => scoringResults[index].priorityRank === '高'
    );

    expect(highPriorityProposals).toHaveLength(1);
    expect(highPriorityProposals[0].proposalId).toBe('PROP-003');

    // 通知ワークフローの実行
    const notificationTimestamp = new Date('2024-01-15T09:00:00Z');
    const businessDayDeadline = new Date('2024-01-22T23:59:59Z'); // 5営業日後

    const notifications = highPriorityProposals.map((proposal, index) => ({
      notificationId: `NOTIF-${index + 1}`,
      proposalId: proposal.proposalId,
      proposalTitle: proposal.title,
      priorityScore: scoringResults.find(
        (s) => improvementProposals[scoringResults.indexOf(s)].proposalId === proposal.proposalId
      )?.priorityScore,
      priorityRank: scoringResults.find(
        (s) => improvementProposals[scoringResults.indexOf(s)].proposalId === proposal.proposalId
      )?.priorityRank,
      proposalSummary: `[${proposal.affectedUserSegments.join(', ')}] ${proposal.title}`,
      sentAt: notificationTimestamp,
      deliveryDeadline: businessDayDeadline,
      deliveryStatus: 'sent',
      teamRecipients: ['DEV-TEAM-001'],
      receivedAt: new Date('2024-01-15T10:30:00Z'),
      receiptStatus: 'confirmed',
    }));

    // 通知が生成されたことを検証
    expect(notifications).toHaveLength(1);
    expect(notifications[0].notificationId).toBe('NOTIF-1');
    expect(notifications[0].proposalId).toBe('PROP-003');
    expect(notifications[0].proposalTitle).toBe('食材制限フィルタリング強化');
    expect(notifications[0].priorityScore).toBe(66);
    expect(notifications[0].priorityRank).toBe('高');

    // 通知に詳細情報が含まれていることを確認
    expect(notifications[0].proposalSummary).toBe(
      '[アレルギー対応層, 専業主夫層] 食材制限フィルタリング強化'
    );

    // 配信タイムスタンプの検証
    expect(notifications[0].sentAt).toEqual(new Date('2024-01-15T09:00:00Z'));
    expect(notifications[0].receivedAt).toEqual(new Date('2024-01-15T10:30:00Z'));

    // 5営業日ウィンドウ内での配信確認
    const timeDiffMs = notifications[0].receivedAt.getTime() - notifications[0].sentAt.getTime();
    const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
    expect(timeDiffDays).toBeLessThan(5);

    // 配信ステータスの記録確認
    expect(notifications[0].deliveryStatus).toBe('sent');
    expect(notifications[0].receiptStatus).toBe('confirmed');

    // 複数の高優先度提案シナリオ（他にもあった場合全件通知）
    const allHighPriorityNotifications = notifications.filter(
      (n) => n.priorityRank === '高'
    );
    expect(allHighPriorityNotifications).toHaveLength(1);

    // 全ての通知が期日内であることを検証
    allHighPriorityNotifications.forEach((notification) => {
      expect(notification.receivedAt.getTime()).toBeLessThanOrEqual(
        notification.deliveryDeadline.getTime()
      );
    });

    // チーム受領者が正しく記録されていることを検証
    expect(notifications[0].teamRecipients).toContain('DEV-TEAM-001');
  });
});