import { notifyImprovementProposalPriority } from '../../src/logic/it-1-1-1';

describe('改善提案の優先度自動通知機能', () => {
  test('SCEN-374: 改善提案が「承認待ち」から「優先度付け完了」以外の状態に変更された場合、通知は送信されない', () => {
    const mockSendNotification = jest.fn();

    const improvementProposal = {
      id: 'proposal-001',
      title: '栄養バランス改善提案',
      previousStatus: '承認待ち',
      currentStatus: '却下',
      priority: 'high',
      content: '栄養基準値の調整が必要',
      notificationSender: mockSendNotification,
    };

    notifyImprovementProposalPriority(improvementProposal);
    expect(mockSendNotification).not.toHaveBeenCalled();

    mockSendNotification.mockClear();

    const improvementProposalImpl = {
      id: 'proposal-002',
      title: '調理時間制約改善提案',
      previousStatus: '承認待ち',
      currentStatus: '実装中',
      priority: 'medium',
      content: '調理時間制約ロジックの最適化',
      notificationSender: mockSendNotification,
    };

    notifyImprovementProposalPriority(improvementProposalImpl);
    expect(mockSendNotification).not.toHaveBeenCalled();

    mockSendNotification.mockClear();

    const improvementProposalComplete = {
      id: 'proposal-003',
      title: 'アレルギー検出改善提案',
      previousStatus: '承認待ち',
      currentStatus: '完了',
      priority: 'low',
      content: 'アレルギー検出アルゴリズムの改善',
      notificationSender: mockSendNotification,
    };

    notifyImprovementProposalPriority(improvementProposalComplete);
    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});