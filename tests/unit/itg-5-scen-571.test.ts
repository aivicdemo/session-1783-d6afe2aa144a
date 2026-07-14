import { notifyDevelopmentTeamOnPriorityComplete } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 栄養士改善提案の優先度通知機能', () => {
  test('SCEN-571: 改善提案が優先度付け完了に変更されたとき、開発チームへの自動通知が送信される', async () => {
    // テストデータ: 栄養士による改善提案を作成
    const nutritionistProposalId = 'proposal_001';
    const nutritionistId = 'nutritionist_123';
    const nutritionistName = '山田太郎';
    const priority = 'high';
    const proposalTitle = '栄養バランス基準ロジック改善';
    const proposalDescription = 'ビタミンD摂取量の基準値を調整する改善案';
    const developmentTeamEmails = [
      'dev1@example.com',
      'dev2@example.com',
      'dev3@example.com'
    ];

    // 改善提案のステータス変更前の初期状態
    const proposalBefore = {
      proposalId: nutritionistProposalId,
      nutritionistId: nutritionistId,
      nutritionistName: nutritionistName,
      title: proposalTitle,
      description: proposalDescription,
      status: '提案受付',
      createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
      priority: null,
      priorityAssignedAt: null
    };

    // 改善提案のステータス変更後の状態
    const proposalAfter = {
      proposalId: nutritionistProposalId,
      nutritionistId: nutritionistId,
      nutritionistName: nutritionistName,
      title: proposalTitle,
      description: proposalDescription,
      status: '優先度付け完了',
      createdAt: proposalBefore.createdAt,
      priority: priority,
      priorityAssignedAt: new Date('2024-01-15T10:30:00Z').toISOString()
    };

    // モック通知送信関数と送信履歴を管理
    let notificationSentCount = 0;
    let sentNotifications: Array<{
      proposalId: string;
      priority: string;
      nutritionistName: string;
      recipients: string[];
      sentAt: string;
      messageContent: string;
    }> = [];

    const mockSendNotification = jest.fn(async (notification: any) => {
      notificationSentCount++;
      sentNotifications.push(notification);
      return { success: true, notificationId: `notif_${notificationSentCount}` };
    });

    const mockLogNotificationHistory = jest.fn(async (record: any) => {
      return { success: true, recordId: `history_${Date.now()}` };
    });

    // 実際の関数を呼び出し
    const result = await notifyDevelopmentTeamOnPriorityComplete(
      {
        proposal: proposalAfter,
        developmentTeamEmails: developmentTeamEmails,
        previousStatus: proposalBefore.status
      },
      {
        sendNotification: mockSendNotification,
        logNotificationHistory: mockLogNotificationHistory
      }
    );

    // アサーション: ステータスが正しく変更されている
    expect(result.proposal.status).toBe('優先度付け完了');
    expect(result.proposal.priority).toBe('high');

    // アサーション: 通知が1回送信されたことを確認
    expect(notificationSentCount).toBe(1);
    expect(mockSendNotification).toHaveBeenCalledTimes(1);

    // アサーション: 送信された通知メッセージに改善提案IDが含まれている
    expect(sentNotifications[0].proposalId).toBe(nutritionistProposalId);

    // アサーション: 送信された通知メッセージに優先度が含まれている
    expect(sentNotifications[0].priority).toBe('high');

    // アサーション: 送信された通知メッセージに栄養士名が含まれている
    expect(sentNotifications[0].nutritionistName).toBe('山田太郎');

    // アサーション: 通知の送信先が正しい開発チームメンバーのメールアドレスである
    expect(sentNotifications[0].recipients).toEqual(developmentTeamEmails);
    expect(sentNotifications[0].recipients.length).toBe(3);
    expect(sentNotifications[0].recipients).toContain('dev1@example.com');
    expect(sentNotifications[0].recipients).toContain('dev2@example.com');
    expect(sentNotifications[0].recipients).toContain('dev3@example.com');

    // アサーション: 通知送信のタイムスタンプが現在時刻に近い（5秒以内）
    const notificationTime = new Date(sentNotifications[0].sentAt).getTime();
    const currentTime = new Date().getTime();
    const timeDifference = Math.abs(currentTime - notificationTime);
    expect(timeDifference).toBeLessThan(5000);

    // アサーション: 通知メッセージコンテンツに提案タイトルが含まれている
    expect(sentNotifications[0].messageContent).toContain(proposalTitle);

    // アサーション: 通知メッセージコンテンツに提案説明が含まれている
    expect(sentNotifications[0].messageContent).toContain(proposalDescription);

    // アサーション: ダッシュボード上に通知送信の履歴レコードが記録されたことを確認
    expect(mockLogNotificationHistory).toHaveBeenCalledTimes(1);

    // アサーション: 送信履歴レコードの内容を検証
    const historyCall = mockLogNotificationHistory.mock.calls[0][0];
    expect(historyCall.proposalId).toBe(nutritionistProposalId);
    expect(historyCall.notificationType).toBe('priority_complete');
    expect(historyCall.status).toBe('sent');
    expect(historyCall.recipientCount).toBe(3);

    // アサーション: 関数の戻り値が正常なレスポンス構造を持っている
    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();
    expect(result.historyRecordId).toBeDefined();
    expect(result.proposal.status).toBe('優先度付け完了');
    expect(result.developmentTeamNotified).toBe(true);
  });
});