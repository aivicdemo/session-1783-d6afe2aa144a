import { generateNotificationForPriorityBoundary } from '../../src/logic/it-1-br-3-2-1';

describe('改善提案の優先度付けと自動通知機能', () => {
  // SCEN-361
  test('優先度が最小値・最大値の境界値で通知が正常に生成される', () => {
    // Precondition: 改善提案データが作成され、優先度が設定可能な状態
    // Trigger: 優先度の最小値（0）と最大値（100）で自動通知をトリガー
    // Outcome: 通知が正常に生成され、優先度情報が正確に反映される

    const proposalMinPriority = {
      proposalId: 'PROP-001',
      proposalTitle: '栄養バランス改善提案',
      proposalDescription: 'カルシウム摂取量の増加が必要です',
      priority: 0,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdByNutritionistId: 'NUT-001',
    };

    const proposalMaxPriority = {
      proposalId: 'PROP-002',
      proposalTitle: '緊急栄養改善提案',
      proposalDescription: '鉄分欠乏の緊急対応が必要です',
      priority: 100,
      createdAt: new Date('2024-01-15T11:00:00Z'),
      createdByNutritionistId: 'NUT-001',
    };

    const resultMinPriority = generateNotificationForPriorityBoundary(
      proposalMinPriority
    );

    const resultMaxPriority = generateNotificationForPriorityBoundary(
      proposalMaxPriority
    );

    // Assert: 最小値（0）の優先度で通知が生成されること
    expect(resultMinPriority).toEqual({
      notificationId: expect.any(String),
      proposalId: 'PROP-001',
      proposalTitle: '栄養バランス改善提案',
      priority: 0,
      notificationContent:
        '改善提案「栄養バランス改善提案」の優先度を付けました。優先度: 0',
      notificationStatus: 'GENERATED',
      createdAt: expect.any(Date),
      sentAt: null,
    });

    // Assert: 最大値（100）の優先度で通知が生成されること
    expect(resultMaxPriority).toEqual({
      notificationId: expect.any(String),
      proposalId: 'PROP-002',
      proposalTitle: '緊急栄養改善提案',
      priority: 100,
      notificationContent:
        '改善提案「緊急栄養改善提案」の優先度を付けました。優先度: 100',
      notificationStatus: 'GENERATED',
      createdAt: expect.any(Date),
      sentAt: null,
    });

    // Assert: 通知ID（システムログ用）が一意に生成されていること
    expect(resultMinPriority.notificationId).not.toEqual(
      resultMaxPriority.notificationId
    );

    // Assert: 優先度情報が正確に反映されていること
    expect(resultMinPriority.priority).toBe(0);
    expect(resultMaxPriority.priority).toBe(100);

    // Assert: 通知内容に優先度値が含まれていること
    expect(resultMinPriority.notificationContent).toContain('優先度: 0');
    expect(resultMaxPriority.notificationContent).toContain('優先度: 100');

    // Assert: 通知ステータスが'GENERATED'であること
    expect(resultMinPriority.notificationStatus).toBe('GENERATED');
    expect(resultMaxPriority.notificationStatus).toBe('GENERATED');

    // Assert: 通知生成時刻がそれぞれ異なること（異なるタイミングで生成）
    expect(
      (resultMaxPriority.createdAt as Date).getTime() >
        (resultMinPriority.createdAt as Date).getTime()
    ).toBe(true);

    // Assert: 送信前の状態（sentAt は null）
    expect(resultMinPriority.sentAt).toBeNull();
    expect(resultMaxPriority.sentAt).toBeNull();
  });
});