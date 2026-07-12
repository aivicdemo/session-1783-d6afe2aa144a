import { sendNutritionistProposalNotification } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-613
  test('改善提案の開発チーム通知トリガー - 栄養士が改善提案を優先度付けして送信した時点で開発チームへの定期通知が正常に実行される', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // Input: 栄養士が改善提案を入力・優先度付けして送信
    const proposalInput = {
      nutritionistId: 'NUT-001',
      nutritionistName: '田中栄養士',
      proposalContent: '朝食のタンパク質量を増加させる',
      priority: 'high',
      proposalType: 'nutrition_adjustment',
      submittedAt: new Date('2024-01-15T10:00:00Z'),
    };

    // Mock: 通知メール送信 API
    fetchMock.mockResponseOnce(
      JSON.stringify({
        notificationId: 'NOTIF-2024-001',
        status: 'sent',
        sentAt: '2024-01-15T10:05:00Z',
        recipientCount: 5,
        emailAddresses: [
          'dev-team1@company.com',
          'dev-team2@company.com',
          'dev-team3@company.com',
          'dev-team4@company.com',
          'dev-team5@company.com',
        ],
      }),
      { status: 200 }
    );

    // Mock: 通知履歴ログ記録 API
    fetchMock.mockResponseOnce(
      JSON.stringify({
        historyId: 'HIST-2024-001',
        status: 'recorded',
        recordedAt: '2024-01-15T10:05:01Z',
      }),
      { status: 200 }
    );

    // Execute
    const result = await sendNutritionistProposalNotification(proposalInput);

    // Assertions

    // 1. 通知結果の構造と値を検証
    expect(result).toHaveProperty('notificationId');
    expect(result.notificationId).toBe('NOTIF-2024-001');
    expect(result.status).toBe('sent');

    // 2. 通知ステータスが 'sent' であることを確認
    expect(result.status).toBe('sent');

    // 3. 送信時刻が提案送信時刻から 5 分以内（300 秒以内）であることを確認
    const submitTime = new Date(proposalInput.submittedAt).getTime();
    const sentTime = new Date(result.sentAt).getTime();
    const timeDiffSeconds = (sentTime - submitTime) / 1000;
    expect(timeDiffSeconds).toBeLessThanOrEqual(300);
    expect(timeDiffSeconds).toBeGreaterThanOrEqual(0);

    // 4. 開発チームの受信者数が 5 名以上であることを確認
    expect(result.recipientCount).toBeGreaterThanOrEqual(5);
    expect(result.emailAddresses).toHaveLength(5);

    // 5. メールアドレスが有効な形式であることを確認
    result.emailAddresses.forEach((email: string) => {
      expect(email).toMatch(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
    });

    // 6. 通知メール内容に栄養士名が含まれていることを検証
    expect(result).toHaveProperty('nutritionistName');
    expect(result.nutritionistName).toBe('田中栄養士');

    // 7. 通知メール内容に改善提案内容が含まれていることを検証
    expect(result).toHaveProperty('proposalContent');
    expect(result.proposalContent).toBe('朝食のタンパク質量を増加させる');

    // 8. 通知メール内容に優先度が含まれていることを検証
    expect(result).toHaveProperty('priority');
    expect(result.priority).toBe('high');

    // 9. アプリケーション通知履歴に送信記録が記録されていることを確認
    expect(result).toHaveProperty('historyId');
    expect(result.historyId).toBe('HIST-2024-001');
    expect(result).toHaveProperty('historyStatus');
    expect(result.historyStatus).toBe('recorded');

    // 10. 通知履歴の記録タイムスタンプが送信完了時刻と一致することを確認
    expect(result.recordedAt).toBe('2024-01-15T10:05:01Z');

    // 11. API の呼び出し回数が 2 回（通知送信 + 履歴記録）であることを確認
    expect(fetchMock.mock.calls.length).toBe(2);

    // 12. 最初の API 呼び出しが通知送信エンドポイントであることを確認
    expect(fetchMock.mock.calls[0][0]).toContain('/notifications/send');

    // 13. 2 番目の API 呼び出しが履歴記録エンドポイントであることを確認
    expect(fetchMock.mock.calls[1][0]).toContain('/notification-history/record');

    // 14. リクエストボディに栄養士 ID が含まれていることを確認
    const firstRequestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstRequestBody.nutritionistId).toBe('NUT-001');

    // 15. リクエストボディに優先度が含まれていることを確認
    expect(firstRequestBody.priority).toBe('high');

    // 16. 優先度が 'high' の場合、通知が即座に送信されることを確認
    expect(result.priority).toBe('high');
    expect(timeDiffSeconds).toBeLessThanOrEqual(60); // 高優先度は 1 分以内に送信

    // 17. 通知結果が成功状態であり、エラーが含まれていないことを確認
    expect(result).not.toHaveProperty('error');
    expect(result).not.toHaveProperty('errorMessage');

    // 18. 返却されたタイムスタンプが ISO 8601 形式であることを確認
    expect(result.sentAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // 19. 提案タイプが正しく保持されていることを確認
    expect(result).toHaveProperty('proposalType');
    expect(result.proposalType).toBe('nutrition_adjustment');

    // 20. 全体的な処理フローが正常に完了していることを確認（統合テスト的検証）
    expect(result.status).toBe('sent');
    expect(result.historyStatus).toBe('recorded');
    expect(result.recipientCount).toBeGreaterThan(0);
  });
});