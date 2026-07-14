import { createVerificationReportAndJudge } from '../../src/logic/it-7-2-1';

describe('週次アルゴリズム改善検証ダッシュボード - 検証結果レポート作成・承認判定', () => {
  // SCEN-694: [edge] 検証結果レポート作成・承認判定 - 判定基準値が境界値の場合、承認可否の判定を正確に行う
  test('should judge approval status accurately at boundary values', () => {
    const passingCriterion = 80.0;
    const reportCreationDate = new Date('2024-01-15T09:00:00Z');

    // ケース1: スコアが基準値と完全に一致した場合 → 承認
    const resultAtBoundary = createVerificationReportAndJudge({
      algorithmVersion: 'v2.1',
      verificationStartDate: new Date('2024-01-08T09:00:00Z'),
      verificationEndDate: new Date('2024-01-15T09:00:00Z'),
      mealGenerationSuccessRate: 80.0,
      cookingTimeReductionDegree: 85.5,
      userSatisfactionScore: 82.3,
      passingCriterion: passingCriterion,
      reportCreationDate: reportCreationDate,
      reviewerUserId: 'reviewer_001',
      businessImpactDescription: 'Improved nutritional balance filtering',
      technicalDifficultyLevel: 3,
      expectedKPIContribution: 5.2,
    });

    expect(resultAtBoundary.reportId).toBeDefined();
    expect(resultAtBoundary.reportId).toMatch(/^REPORT-/);
    expect(resultAtBoundary.verificationScore).toBe(80.0);
    expect(resultAtBoundary.judgmentResult).toBe('APPROVED');
    expect(resultAtBoundary.judgmentReason).toMatch(/boundary/i);
    expect(resultAtBoundary.createdAt).toEqual(reportCreationDate);

    // ケース2: スコアが基準値より1単位下回る場合 → 不承認
    const resultBelowBoundary = createVerificationReportAndJudge({
      algorithmVersion: 'v2.1',
      verificationStartDate: new Date('2024-01-08T09:00:00Z'),
      verificationEndDate: new Date('2024-01-15T09:00:00Z'),
      mealGenerationSuccessRate: 79.9,
      cookingTimeReductionDegree: 85.5,
      userSatisfactionScore: 82.3,
      passingCriterion: passingCriterion,
      reportCreationDate: reportCreationDate,
      reviewerUserId: 'reviewer_001',
      businessImpactDescription: 'Improved nutritional balance filtering',
      technicalDifficultyLevel: 3,
      expectedKPIContribution: 5.2,
    });

    expect(resultBelowBoundary.reportId).toBeDefined();
    expect(resultBelowBoundary.verificationScore).toBe(79.9);
    expect(resultBelowBoundary.judgmentResult).toBe('REJECTED');
    expect(resultBelowBoundary.judgmentReason).toMatch(/below/i);

    // ケース3: スコアが基準値より1単位上回る場合 → 承認
    const resultAboveBoundary = createVerificationReportAndJudge({
      algorithmVersion: 'v2.1',
      verificationStartDate: new Date('2024-01-08T09:00:00Z'),
      verificationEndDate: new Date('2024-01-15T09:00:00Z'),
      mealGenerationSuccessRate: 80.1,
      cookingTimeReductionDegree: 85.5,
      userSatisfactionScore: 82.3,
      passingCriterion: passingCriterion,
      reportCreationDate: reportCreationDate,
      reviewerUserId: 'reviewer_001',
      businessImpactDescription: 'Improved nutritional balance filtering',
      technicalDifficultyLevel: 3,
      expectedKPIContribution: 5.2,
    });

    expect(resultAboveBoundary.reportId).toBeDefined();
    expect(resultAboveBoundary.verificationScore).toBe(80.1);
    expect(resultAboveBoundary.judgmentResult).toBe('APPROVED');
    expect(resultAboveBoundary.judgmentReason).toMatch(/exceeds/i);

    // 一貫性検証: 3つのケースで judgment logic が正確であることを確認
    expect(resultAtBoundary.judgmentResult).toBe(resultAboveBoundary.judgmentResult);
    expect(resultAtBoundary.judgmentResult).not.toBe(resultBelowBoundary.judgmentResult);
    expect(resultBelowBoundary.judgmentResult).toBe('REJECTED');

    // 浮動小数点演算誤差チェック: 各レポートの scores 配列が正確に計算されていることを確認
    expect(resultAtBoundary.algorithmPerformanceMetrics).toBeDefined();
    expect(resultAtBoundary.algorithmPerformanceMetrics.successRate).toBe(80.0);
    expect(resultAtBoundary.algorithmPerformanceMetrics.cookingTimeReductionDegree).toBe(85.5);
    expect(resultAtBoundary.algorithmPerformanceMetrics.userSatisfactionScore).toBe(82.3);

    expect(resultBelowBoundary.algorithmPerformanceMetrics.successRate).toBe(79.9);
    expect(resultAboveBoundary.algorithmPerformanceMetrics.successRate).toBe(80.1);

    // 判定ロジックの一貫性を検証: 浮動小数点誤差なしに判定が行われていること
    const boundaryDifference = resultAboveBoundary.verificationScore - resultBelowBoundary.verificationScore;
    expect(boundaryDifference).toBe(0.2);

    // レポートメタデータの一貫性確認
    expect(resultAtBoundary.algorithmVersion).toBe('v2.1');
    expect(resultBelowBoundary.algorithmVersion).toBe('v2.1');
    expect(resultAboveBoundary.algorithmVersion).toBe('v2.1');

    expect(resultAtBoundary.reviewerUserId).toBe('reviewer_001');
    expect(resultBelowBoundary.reviewerUserId).toBe('reviewer_001');
    expect(resultAboveBoundary.reviewerUserId).toBe('reviewer_001');
  });
});