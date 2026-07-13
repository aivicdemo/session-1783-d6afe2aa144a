import { generateVerificationReportWithImpact } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養基準ロジック改善提案の優先度付けと開発チーム提出 - 検証結果レポート生成', () => {
  // SCEN-503: [error] 検証結果レポート生成 - 効果測定データが不完全な場合にレポート生成エラーを返す
  test('should throw error when effect measurement data is incomplete - missing required fields', () => {
    const incompleteEffectMeasurementData = {
      // 実施日（executionDate）が欠落
      targetUserId: 'user_12345',
      measurementItemName: 'カルシウム摂取量達成率',
      preImplementationValue: 65,
      postImplementationValue: 82,
      improvementPercentage: 26.15,
    };

    const reportGenerationRequest = {
      verificationCycleId: 'cycle_202501_q1',
      improvementProposalId: 'proposal_ca001',
      effectMeasurementData: incompleteEffectMeasurementData,
      approvalBaseline: {
        minAchievementRateThreshold: 70,
        maxImplementationDaysThreshold: 30,
      },
    };

    expect(() =>
      generateVerificationReportWithImpact(reportGenerationRequest)
    ).toThrow(/必須フィールド/);
  });

  test('should throw error when effect measurement data is incomplete - missing targetUserId', () => {
    const incompleteEffectMeasurementData = {
      executionDate: '2025-01-15T10:30:00Z',
      // targetUserId が欠落
      measurementItemName: '鉄分摂取量達成率',
      preImplementationValue: 58,
      postImplementationValue: 79,
      improvementPercentage: 36.21,
    };

    const reportGenerationRequest = {
      verificationCycleId: 'cycle_202501_q1',
      improvementProposalId: 'proposal_fe002',
      effectMeasurementData: incompleteEffectMeasurementData,
      approvalBaseline: {
        minAchievementRateThreshold: 70,
        maxImplementationDaysThreshold: 30,
      },
    };

    expect(() =>
      generateVerificationReportWithImpact(reportGenerationRequest)
    ).toThrow(/必須フィールド/);
  });

  test('should throw error when effect measurement data is incomplete - missing measurementItemName', () => {
    const incompleteEffectMeasurementData = {
      executionDate: '2025-01-15T10:30:00Z',
      targetUserId: 'user_54321',
      // measurementItemName が欠落
      preImplementationValue: 72,
      postImplementationValue: 88,
      improvementPercentage: 22.22,
    };

    const reportGenerationRequest = {
      verificationCycleId: 'cycle_202501_q1',
      improvementProposalId: 'proposal_vit003',
      effectMeasurementData: incompleteEffectMeasurementData,
      approvalBaseline: {
        minAchievementRateThreshold: 70,
        maxImplementationDaysThreshold: 30,
      },
    };

    expect(() =>
      generateVerificationReportWithImpact(reportGenerationRequest)
    ).toThrow(/必須フィールド/);
  });

  test('should successfully generate verification report when all required fields are present', () => {
    const completeEffectMeasurementData = {
      executionDate: '2025-01-15T10:30:00Z',
      targetUserId: 'user_12345',
      measurementItemName: 'カルシウム摂取量達成率',
      preImplementationValue: 65,
      postImplementationValue: 82,
      improvementPercentage: 26.15,
      kpiContributionDegree: 'high',
      implementationDaysRequired: 14,
    };

    const reportGenerationRequest = {
      verificationCycleId: 'cycle_202501_q1',
      improvementProposalId: 'proposal_ca001',
      effectMeasurementData: completeEffectMeasurementData,
      approvalBaseline: {
        minAchievementRateThreshold: 70,
        maxImplementationDaysThreshold: 30,
      },
    };

    const result = generateVerificationReportWithImpact(reportGenerationRequest);

    expect(result).toBeDefined();
    expect(result.verificationReportId).toBeDefined();
    expect(result.improvementProposalId).toBe('proposal_ca001');
    expect(result.verificationCycleId).toBe('cycle_202501_q1');
    expect(result.reportStatus).toBe('completed');
    expect(result.postImplementationAchievementRate).toBe(82);
    expect(result.improvementPercentage).toBe(26.15);
    expect(result.approvalJudgment).toBe('approved');
  });

  test('should throw error when preImplementationValue or postImplementationValue is null', () => {
    const incompleteEffectMeasurementData = {
      executionDate: '2025-01-15T10:30:00Z',
      targetUserId: 'user_99999',
      measurementItemName: 'ビタミンD摂取量達成率',
      preImplementationValue: null,
      postImplementationValue: 75,
      improvementPercentage: 0,
    };

    const reportGenerationRequest = {
      verificationCycleId: 'cycle_202501_q1',
      improvementProposalId: 'proposal_vitd004',
      effectMeasurementData: incompleteEffectMeasurementData,
      approvalBaseline: {
        minAchievementRateThreshold: 70,
        maxImplementationDaysThreshold: 30,
      },
    };

    expect(() =>
      generateVerificationReportWithImpact(reportGenerationRequest)
    ).toThrow(/必須フィールド/);
  });
});