import { evaluateReportForApproval } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案レポート承認判定機能', () => {
  // SCEN-506
  test('承認基準を満たさないレポートを却下判定する', () => {
    const reportInput = {
      reportId: 'RPT-20240115-001',
      submitterId: 'NUTRI-2024-0001',
      submitterName: '栄養士 山田太郎',
      submissionTimestamp: new Date('2024-01-15T10:30:00Z'),
      reportTitle: '1月栄養基準ロジック検証レポート',
      nutritionItems: [
        {
          itemId: 'NUT-001',
          itemName: 'タンパク質',
          recommendedValue: 50,
          achievementRate: 75,
          status: 'achieved',
        },
        {
          itemId: 'NUT-002',
          itemName: '食物繊維',
          recommendedValue: 25,
          achievementRate: 45,
          status: 'insufficient',
        },
      ],
      improvementProposals: [
        {
          proposalId: 'IMP-001',
          category: '栄養バランス',
          description: '食物繊維摂取量が基準値の45%に留まっているため、献立に全粒穀物と豆類を増加させる提案',
          businessValue: 7,
          technicalDifficulty: 5,
          userImpact: 8,
          priorityScore: 0,
          estimatedImplementationDays: 5,
          expectedEffectDescription: '食物繊維摂取量を70%以上に改善',
        },
      ],
      improvementSummary: '1月の検証では食物繊維が主な不足項目。改善提案は妥当性あり。',
      previousMonthComparisonScore: 65,
      dataQualityScore: 72,
      recommendationForNextCycle: 'タンパク質は達成、食物繊維とビタミンD改善に注力',
      approvalCriteria: {
        minDataQualityScore: 80,
        minPreviousMonthComparisonScore: 70,
        requiredProposalCount: 1,
      },
      rejectionReason: '必須データ品質基準未達成（72 < 80）',
      rejectionDetails: 'データ品質スコアが基準値80以下である。栄養士に再検証を依頼',
      statusBefore: '承認待ち',
      statusAfter: '却下',
      auditLogEntry: {
        operationId: 'AUD-20240115-001',
        operatorId: 'PM-2024-0001',
        operatorName: 'プロダクトマネージャー 佐藤花子',
        operationTimestamp: new Date('2024-01-15T11:00:00Z'),
        operationType: 'レポート却下判定',
        operationDetails: '承認基準未達成により却下',
        systemStatus: 'success',
      },
      notificationToSubmitter: {
        notificationId: 'NOTIF-20240115-001',
        notificationType: 'レポート却下通知',
        recipientId: 'NUTRI-2024-0001',
        recipientEmail: 'yamada.taro@nutrition-app.com',
        notificationTitle: 'レポート却下のお知らせ',
        notificationBody: '1月栄養基準ロジック検証レポート（RPT-20240115-001）が承認基準未達成により却下されました。データ品質スコアを改善後、再提出ください。',
        sentTimestamp: new Date('2024-01-15T11:01:00Z'),
        deliveryStatus: 'sent',
      },
    };

    const result = evaluateReportForApproval(reportInput);

    // 1. ステータス遷移を検証: 承認待ち → 却下
    expect(result.statusAfter).toBe('却下');
    expect(result.statusTransitionValid).toBe(true);

    // 2. 承認基準の充足判定を検証
    expect(result.meetsApprovalCriteria).toBe(false);
    expect(result.criteriaEvaluationResults).toEqual({
      dataQualityScoreMeetsStandard: false, // 72 < 80
      previousMonthComparisonScoreMeetsStandard: false, // 65 < 70
      requiredProposalCountMet: true, // 1 >= 1
    });

    // 3. 却下理由が正しく記録される
    expect(result.rejectionReason).toBe('必須データ品質基準未達成（72 < 80）');
    expect(result.rejectionDetails).toBe('データ品質スコアが基準値80以下である。栄養士に再検証を依頼');

    // 4. 監査ログが記録される
    expect(result.auditLogEntry).toBeDefined();
    expect(result.auditLogEntry.operationId).toBe('AUD-20240115-001');
    expect(result.auditLogEntry.operationType).toBe('レポート却下判定');
    expect(result.auditLogEntry.operationTimestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(result.auditLogEntry.systemStatus).toBe('success');

    // 5. レポート提出者への却下通知が送信される
    expect(result.notificationToSubmitter).toBeDefined();
    expect(result.notificationToSubmitter.notificationType).toBe('レポート却下通知');
    expect(result.notificationToSubmitter.recipientId).toBe('NUTRI-2024-0001');
    expect(result.notificationToSubmitter.notificationTitle).toBe('レポート却下のお知らせ');
    expect(result.notificationToSubmitter.deliveryStatus).toBe('sent');
    expect(result.notificationToSubmitter.sentTimestamp).toEqual(new Date('2024-01-15T11:01:00Z'));

    // 6. レポート詳細情報が保持される
    expect(result.reportId).toBe('RPT-20240115-001');
    expect(result.submitterId).toBe('NUTRI-2024-0001');
    expect(result.submitterName).toBe('栄養士 山田太郎');

    // 7. 栄養項目の評価結果が保持される
    expect(result.nutritionItems.length).toBe(2);
    expect(result.nutritionItems[1].status).toBe('insufficient');
    expect(result.nutritionItems[1].achievementRate).toBe(45);

    // 8. 改善提案が却下理由に関連付けられる
    expect(result.improvementProposals.length).toBe(1);
    expect(result.improvementProposals[0].proposalId).toBe('IMP-001');

    // 9. 総合判定結果を検証
    expect(result.finalJudgment).toBe('却下');
    expect(result.judgmentReason).toBe('データ品質基準および前月比較基準を未達成');
  });
});