import { notifyDevelopmentTeamOnImprovementProposal } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-614
  test('改善提案の開発チーム通知トリガー - 通知先の開発チームメンバーが未設定の場合にエラーハンドリングされる', () => {
    const improvementProposal = {
      proposalId: 'PROP-001',
      title: '栄養バランスロジック改善',
      description: '家族の栄養摂取データを週次で学習し、不足栄養素を献立に反映させる機能',
      proposedBy: 'USER-nutritionist-001',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      status: 'approval_pending',
      priority: 'high',
    };

    const notificationSettings = {
      developmentTeamMembers: [],
      notificationChannels: ['slack', 'email'],
      priority: 'urgent',
    };

    expect(() =>
      notifyDevelopmentTeamOnImprovementProposal(
        improvementProposal,
        notificationSettings
      )
    ).toThrow(/通知先メンバー/);
  });
});