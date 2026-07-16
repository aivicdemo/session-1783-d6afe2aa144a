import { sendImprovementProposalNotification } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-271
  test('改善提案通知機能 - 栄養士による改善提案優先度付与後に開発チームへの定期通知が送信される', () => {
    // Precondition: 栄養士が改善提案を入力し、システムに保存された状態
    // Trigger: 栄養士が改善提案を優先度付けして送信ボタンを押した時点
    // Outcome: 開発チームに定期通知され、改善ロジック反映の段階的対応が開始される

    const nutritionistId = 'NUT-001';
    const nutritionistName = '栄養士 太郎';
    const proposalId = 'PROP-2024-001';
    const proposalContent = '献立生成アルゴリズムで栄養バランス不適切パターンの改善';
    const assignedPriority = 'high';
    const proposalDate = new Date('2024-01-15T10:30:00Z');
    const developmentTeamEmails = [
      'dev-lead@example.com',
      'dev-member-1@example.com',
      'dev-member-2@example.com'
    ];
    const notificationScheduleTime = new Date('2024-01-15T18:00:00Z');
    const expectedDuelineTargetDays = 5;

    const input = {
      proposalId: proposalId,
      content: proposalContent,
      priority: assignedPriority,
      nutritionistId: nutritionistId,
      nutritionistName: nutritionistName,
      proposalDate: proposalDate,
      developmentTeamEmails: developmentTeamEmails,
      notificationScheduleTime: notificationScheduleTime,
      expectedDuelineTargetDays: expectedDuelineTargetDays
    };

    const result = sendImprovementProposalNotification(input);

    // 通知が送信されたか検証
    expect(result.notificationSent).toBe(true);

    // 送信対象のメールアドレス数を検証
    expect(result.recipientCount).toBe(3);

    // 送信された通知内容を検証
    expect(result.notificationContent).toEqual({
      proposalId: proposalId,
      content: proposalContent,
      priority: assignedPriority,
      nutritionistName: nutritionistName,
      proposalDate: proposalDate.toISOString(),
      expectedDuelineDate: new Date('2024-01-20T18:00:00Z').toISOString()
    });

    // 各メールアドレスへの送信状態を検証
    expect(result.deliveryStatus).toEqual([
      { email: 'dev-lead@example.com', status: 'sent' },
      { email: 'dev-member-1@example.com', status: 'sent' },
      { email: 'dev-member-2@example.com', status: 'sent' }
    ]);

    // 通知送信タイムスタンプが記録されているか検証
    expect(result.sentAt).toEqual(notificationScheduleTime.toISOString());

    // 提案優先度がシステムに保存されているか検証
    expect(result.priorityRecorded).toBe(true);
    expect(result.recordedPriority).toBe(assignedPriority);
  });
});