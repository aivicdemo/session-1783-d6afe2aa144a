import { generateNotificationForImprovement } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-360
  test('改善提案に優先度が未設定の状態で通知生成を試行したとき、エラーが発生する', () => {
    const improvementProposal = {
      id: 'proposal-001',
      userId: 'user-12345',
      content: '夜間割引を活用して食費を削減する',
      priority: undefined,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() => generateNotificationForImprovement(improvementProposal)).toThrow(/優先度/);
  });
});