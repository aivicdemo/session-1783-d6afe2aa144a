import { generateNotificationForDevelopmentTeam } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案優先度付け・通知機能', () => {
  // SCEN-539: [normal] 改善提案優先度付け・通知機能 - 優先度スコアリング完了後、開発チームへの提案通知が正常に生成される
  test('should generate notification for development team with priority ranking and proposal details after scoring', () => {
    const input = {
      prioritizedProposals: [
        {
          proposalId: 'PROP-001',
          title: 'タンパク質摂取基準の引き上げ',
          description: '現在のタンパク質推奨値は不十分で、ユーザーの筋肉維持に支障がある可能性がある',
          businessValue: 9,
          technicalDifficulty: 3,
          userImpact: 8,
          totalPriorityScore: 73,
          priorityRank: 1,
          affectedNutrients: ['タンパク質'],
          affectedUserSegments: ['40代以上', '筋トレ習慣あり'],
          implementationEstimate: '2週間',
          expectedEffectMessage: 'ユーザーのタンパク質摂取量が平均15%増加',
          kpiContribution: 'ユーザー満足度スコア +5%'
        },
        {
          proposalId: 'PROP-002',
          title: 'ビタミンD不足の検出ロジック改善',
          description: 'ビタミンD不足を検出する栄養基準ロジックの精度を向上させる',
          businessValue: 7,
          technicalDifficulty: 5,
          userImpact: 6,
          totalPriorityScore: 58,
          priorityRank: 2,
          affectedNutrients: ['ビタミンD'],
          affectedUserSegments: ['女性', '冬季ユーザー'],
          implementationEstimate: '4週間',
          expectedEffectMessage: 'ビタミンD不足の検出精度が90%から95%に向上',
          kpiContribution: '栄養基準達成率 +3%'
        },
        {
          proposalId: 'PROP-003',
          title: '食物繊維摂取推奨量の動的調整',
          description: '年齢別・性別の食物繊維摂取推奨量を更新する',
          businessValue: 6,
          technicalDifficulty: 2,
          userImpact: 5,
          totalPriorityScore: 48,
          priorityRank: 3,
          affectedNutrients: ['食物繊維'],
          affectedUserSegments: ['全年代'],
          implementationEstimate: '1週間',
          expectedEffectMessage: '食物繊維摂取量の達成率が平均12%向上',
          kpiContribution: '健康関連KPI +2%'
        }
      ],
      generatedAt: new Date('2024-01-22T14:30:00Z'),
      generatorUserId: 'PM-USER-001',
      generatorUserRole: 'ProductManager'
    };

    const result = generateNotificationForDevelopmentTeam(input);

    expect(result).toBeDefined();
    expect(result.notificationId).toBeTruthy();
    expect(result.notificationId).toMatch(/^NOTIF-/);

    expect(result.recipientTeam).toBe('DevelopmentTeam');
    expect(result.recipientEmail).toBe('dev-team@example.com');

    expect(result.subject).toContain('改善提案');
    expect(result.subject).toContain('優先度付け完了');

    expect(result.messagebody).toContain('タンパク質摂取基準の引き上げ');
    expect(result.messagebody).toContain('優先度ランキング');
    expect(result.messagebody).toContain('1位');
    expect(result.messagebody).toContain('2位');
    expect(result.messagebody).toContain('3位');

    expect(result.messagebody).toContain('PROP-001');
    expect(result.messagebody).toContain('PROP-002');
    expect(result.messagebody).toContain('PROP-003');

    expect(result.messagebody).toContain('タンパク質');
    expect(result.messagebody).toContain('ビタミンD不足の検出ロジック改善');
    expect(result.messagebody).toContain('食物繊維摂取推奨量の動的調整');

    expect(result.messagebody).toContain('2週間');
    expect(result.messagebody).toContain('4週間');
    expect(result.messagebody).toContain('1週間');

    expect(result.messagebody).toContain('ユーザーのタンパク質摂取量が平均15%増加');
    expect(result.messagebody).toContain('ビタミンD不足の検出精度が90%から95%に向上');
    expect(result.messagebody).toContain('食物繊維摂取量の達成率が平均12%向上');

    expect(result.messagebody).toContain('ユーザー満足度スコア +5%');
    expect(result.messagebody).toContain('栄養基準達成率 +3%');
    expect(result.messagebody).toContain('健康関連KPI +2%');

    expect(result.priorityRanking).toBeDefined();
    expect(Array.isArray(result.priorityRanking)).toBe(true);
    expect(result.priorityRanking).toHaveLength(3);

    expect(result.priorityRanking[0]).toEqual({
      rank: 1,
      proposalId: 'PROP-001',
      title: 'タンパク質摂取基準の引き上げ',
      totalPriorityScore: 73
    });
    expect(result.priorityRanking[1]).toEqual({
      rank: 2,
      proposalId: 'PROP-002',
      title: 'ビタミンD不足の検出ロジック改善',
      totalPriorityScore: 58
    });
    expect(result.priorityRanking[2]).toEqual({
      rank: 3,
      proposalId: 'PROP-003',
      title: '食物繊維摂取推奨量の動的調整',
      totalPriorityScore: 48
    });

    expect(result.proposalSummary).toBeDefined();
    expect(Array.isArray(result.proposalSummary)).toBe(true);
    expect(result.proposalSummary).toHaveLength(3);

    const prop001Summary = result.proposalSummary.find(
      (s: any) => s.proposalId === 'PROP-001'
    );
    expect(prop001Summary).toBeDefined();
    expect(prop001Summary.title).toBe('タンパク質摂取基準の引き上げ');
    expect(prop001Summary.description).toBe(
      '現在のタンパク質推奨値は不十分で、ユーザーの筋肉維持に支障がある可能性がある'
    );
    expect(prop001Summary.businessValue).toBe(9);
    expect(prop001Summary.technicalDifficulty).toBe(3);
    expect(prop001Summary.userImpact).toBe(8);
    expect(prop001Summary.totalPriorityScore).toBe(73);
    expect(prop001Summary.affectedNutrients).toEqual(['タンパク質']);
    expect(prop001Summary.affectedUserSegments).toEqual([
      '40代以上',
      '筋トレ習慣あり'
    ]);
    expect(prop001Summary.implementationEstimate).toBe('2週間');
    expect(prop001Summary.expectedEffect).toBe(
      'ユーザーのタンパク質摂取量が平均15%増加'
    );
    expect(prop001Summary.kpiContribution).toBe('ユーザー満足度スコア +5%');

    const prop002Summary = result.proposalSummary.find(
      (s: any) => s.proposalId === 'PROP-002'
    );
    expect(prop002Summary).toBeDefined();
    expect(prop002Summary.totalPriorityScore).toBe(58);

    const prop003Summary = result.proposalSummary.find(
      (s: any) => s.proposalId === 'PROP-003'
    );
    expect(prop003Summary).toBeDefined();
    expect(prop003Summary.totalPriorityScore).toBe(48);

    expect(result.createdAt).toBeDefined();
    expect(result.createdAt instanceof Date).toBe(true);

    expect(result.status).toBe('GENERATED');
    expect(result.isStored).toBe(true);

    expect(result.storagePath).toBeTruthy();
    expect(result.storagePath).toContain('notifications');
    expect(result.storagePath).toContain(result.notificationId);

    expect(result.notificationTimestamp).toBeDefined();
    expect(result.notificationTimestamp instanceof Date).toBe(true);
    expect(result.notificationTimestamp.getTime()).toBeGreaterThanOrEqual(
      input.generatedAt.getTime()
    );
  });
});