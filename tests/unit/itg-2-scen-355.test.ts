import { prioritizeAndNotifyImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案の優先度付けと開発チーム自動通知', () => {
  // SCEN-355
  test('優先度付け完了状態の改善提案が開発チームに正しく通知される', () => {
    const proposalId = 'PROP-20240115-001';
    const nutritionistId = 'NUTRI-00001';
    const proposalTitle = '栄養バランスロジック改善提案';
    const proposalContent = 'タンパク質摂取量の基準値を年齢別に細分化し、より正確な栄養基準を設定する';
    const businessValue = 85;
    const technicalDifficulty = 65;
    const userImpact = 78;
    const priorityCompletedAt = new Date('2024-01-15T10:30:00Z');
    const expectedPriorityScore = ((businessValue + userImpact) / 2) - (technicalDifficulty / 10);
    const expectedPriorityRank =
      expectedPriorityScore >= 80 ? 'HIGH' : expectedPriorityScore >= 50 ? 'MEDIUM' : 'LOW';
    const devTeamEmails = ['dev-team@company.com', 'architect@company.com'];
    const expectedNotificationContent = {
      proposalId,
      proposalTitle,
      priorityRank: expectedPriorityRank,
      priorityScore: Math.round(expectedPriorityScore),
      businessValue,
      technicalDifficulty,
      userImpact,
      proposalContent,
      completedAt: priorityCompletedAt.toISOString(),
    };

    const input = {
      proposalId,
      nutritionistId,
      proposalTitle,
      proposalContent,
      businessValue,
      technicalDifficulty,
      userImpact,
      priorityStatus: 'COMPLETED',
      priorityCompletedAt,
      devTeamEmails,
    };

    const result = prioritizeAndNotifyImprovementProposal(input);

    expect(result.success).toBe(true);
    expect(result.proposalId).toBe(proposalId);
    expect(result.priorityStatus).toBe('COMPLETED');
    expect(result.priorityRank).toBe(expectedPriorityRank);
    expect(result.priorityScore).toBe(Math.round(expectedPriorityScore));
    expect(result.notificationSent).toBe(true);
    expect(result.notificationRecipients).toEqual(devTeamEmails);
    expect(result.notificationTimestamp).not.toBeNull();
    expect(new Date(result.notificationTimestamp).getTime()).toBeGreaterThanOrEqual(
      priorityCompletedAt.getTime()
    );
    expect(result.notificationContent).toEqual(expectedNotificationContent);
    expect(result.slaCompliance).toBe(true);
    expect(result.notificationDeliveryStatus).toEqual({
      'dev-team@company.com': 'DELIVERED',
      'architect@company.com': 'DELIVERED',
    });
  });
});