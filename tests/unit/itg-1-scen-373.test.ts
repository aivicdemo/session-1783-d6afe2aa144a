import { notifyDevelopmentTeamOnPriorityChange } from '../../src/logic/it-1-1-1';

describe('改善提案の優先度自動通知機能', () => {
  // SCEN-373
  test('通知対象の開発チームが未設定の場合、通知送信がスキップされエラーログが記録される', () => {
    const improvementProposal = {
      proposalId: 'PROPOSAL-001',
      title: '献立生成アルゴリズムの栄養バランス計算ロジック改善',
      description: 'カロリー計算式の精度向上',
      previousPriority: 'LOW',
      newPriority: 'HIGH',
      nutritionistId: 'NUTRITIONIST-A001',
      proposalCreatedAt: '2024-01-15T10:00:00Z',
      developmentTeamId: null,
      developmentTeamContactEmail: null,
    };

    const mockLogs: string[] = [];
    const originalConsoleError = console.error;
    console.error = jest.fn((message: string) => {
      mockLogs.push(message);
    });

    const result = notifyDevelopmentTeamOnPriorityChange(improvementProposal);

    console.error = originalConsoleError;

    expect(result.notificationSent).toBe(false);
    expect(result.skipReason).toBe('開発チームが未設定のため通知をスキップしました');
    expect(result.errorLogged).toBe(true);
    expect(mockLogs.length).toBeGreaterThan(0);
    expect(mockLogs[0]).toContain('開発チーム');
  });
});