import { describe, test, expect, beforeEach } from '@jest/globals';
import { calculateStageVerificationMetrics } from '../../src/logic/it-1-1-1';

describe('段階的アルゴリズム展開と効果検証', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-494
  test('各段階の検証効果の定量値が正しく計算され、次段階展開判定根拠として記録される', () => {
    // ===== 前提条件: 初期段階（第1段階）のアルゴリズム検証実行
    const stage1Input = {
      stageNumber: 1,
      algorithmVersionId: 'algo-v2-stage1',
      targetUserSegmentId: 'segment-busy-parent',
      verificationDataPoints: 120,
      successfulGenerations: 108,
      averageProcessingTimeMs: 2400,
      recommendedAccuracyThresholdPercent: 85,
      userSatisfactionScoreAvg: 4.2,
      mealCompletionRatePercent: 89,
      rejectionRatePercent: 12,
      cookingTimeReductionPercent: 18,
      referenceMetricsFromPreviousCycle: {
        accuracyRatePercent: 82,
        avgProcessingTimeMs: 2600,
        userSatisfactionScoreAvg: 3.9,
        mealCompletionRatePercent: 86,
        rejectionRatePercent: 14,
      },
    };

    // ===== アクション: 第1段階の検証効果定量値を計算
    const stage1Result = calculateStageVerificationMetrics(stage1Input);

    // ===== 検証: 第1段階の定量値が正確に計算されたことを確認
    // 精度率（成功数 / 検証データポイント数）= 108 / 120 = 0.9 = 90%
    expect(stage1Result.calculatedAccuracyRatePercent).toBe(90);

    // 前段階比精度向上度 = (90 - 82) / 82 * 100 = 9.76%
    expect(stage1Result.accuracyImprovementRatePercent).toBeCloseTo(9.76, 1);

    // 処理時間短縮度 = (2600 - 2400) / 2600 * 100 = 7.69%
    expect(stage1Result.processingTimeReductionPercent).toBeCloseTo(7.69, 1);

    // 満足度スコア向上度 = (4.2 - 3.9) / 3.9 * 100 = 7.69%
    expect(stage1Result.userSatisfactionImprovementPercent).toBeCloseTo(7.69, 1);

    // 完食率向上度 = (89 - 86) / 86 * 100 = 3.49%
    expect(stage1Result.mealCompletionImprovementPercent).toBeCloseTo(3.49, 1);

    // 却下率改善度 = (14 - 12) / 14 * 100 = 14.29%
    expect(stage1Result.rejectionRateImprovementPercent).toBeCloseTo(14.29, 1);

    // 調理時間短縮度
    expect(stage1Result.cookingTimeReductionPercent).toBe(18);

    // 記録タイムスタンプは ISO 8601 形式
    expect(stage1Result.recordedAtUtc).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // ===== 検証: 次段階展開判定ロジックが実行されたことを確認
    // 判定基準:
    // - 精度率 >= 推奨精度閾値（90 >= 85）✓
    // - 精度向上度 >= 5% (9.76 >= 5) ✓
    // - 処理時間削減 >= 5% (7.69 >= 5) ✓
    // - 満足度向上 >= 3% (7.69 >= 3) ✓
    // → 次段階展開判定 = "PROCEED_TO_NEXT_STAGE"
    expect(stage1Result.nextStageDeploymentDecision).toBe('PROCEED_TO_NEXT_STAGE');

    // 判定根拠をシステムログに記録
    expect(stage1Result.deploymentDecisionRationale).toEqual({
      accuracyMet: true,
      accuracyThreshold: 85,
      accuracyActual: 90,
      improvementRateMet: true,
      improvementThreshold: 5,
      improvementActual: 9.76,
      processingTimeSavingsMet: true,
      processingTimeSavingsThreshold: 5,
      processingTimeSavingsActual: 7.69,
      userSatisfactionMet: true,
      userSatisfactionThreshold: 3,
      userSatisfactionActual: 7.69,
    });

    // ===== 検証: 第1段階の定量値と判定根拠がデータベースに記録されたことを確認
    expect(stage1Result.persistenceStatus).toBe('RECORDED_TO_DB');
    expect(stage1Result.recordId).toMatch(/^stage-1-verify-\d{13}$/);
    expect(stage1Result.algorithmVersionId).toBe('algo-v2-stage1');

    // ===== アクション: 第2段階のアルゴリズム検証を実行（第1段階の判定がPROCEED_TO_NEXT_STAGEの場合）
    const stage2Input = {
      stageNumber: 2,
      algorithmVersionId: 'algo-v2-stage2',
      targetUserSegmentId: 'segment-busy-parent',
      verificationDataPoints: 250,
      successfulGenerations: 237,
      averageProcessingTimeMs: 2100,
      recommendedAccuracyThresholdPercent: 88,
      userSatisfactionScoreAvg: 4.4,
      mealCompletionRatePercent: 91,
      rejectionRatePercent: 9,
      cookingTimeReductionPercent: 22,
      referenceMetricsFromPreviousCycle: {
        accuracyRatePercent: 90,
        avgProcessingTimeMs: 2400,
        userSatisfactionScoreAvg: 4.2,
        mealCompletionRatePercent: 89,
        rejectionRatePercent: 12,
      },
    };

    const stage2Result = calculateStageVerificationMetrics(stage2Input);

    // ===== 検証: 第2段階の定量値が正確に計算されたことを確認
    // 精度率 = 237 / 250 = 0.948 = 94.8%
    expect(stage2Result.calculatedAccuracyRatePercent).toBeCloseTo(94.8, 1);

    // 精度向上度 = (94.8 - 90) / 90 * 100 = 5.33%
    expect(stage2Result.accuracyImprovementRatePercent).toBeCloseTo(5.33, 1);

    // 処理時間短縮度 = (2400 - 2100) / 2400 * 100 = 12.5%
    expect(stage2Result.processingTimeReductionPercent).toBeCloseTo(12.5, 1);

    // 満足度スコア向上度 = (4.4 - 4.2) / 4.2 * 100 = 4.76%
    expect(stage2Result.userSatisfactionImprovementPercent).toBeCloseTo(4.76, 1);

    // 完食率向上度 = (91 - 89) / 89 * 100 = 2.25%
    expect(stage2Result.mealCompletionImprovementPercent).toBeCloseTo(2.25, 1);

    // 却下率改善度 = (12 - 9) / 12 * 100 = 25%
    expect(stage2Result.rejectionRateImprovementPercent).toBe(25);

    // 調理時間短縮度
    expect(stage2Result.cookingTimeReductionPercent).toBe(22);

    // ===== 検証: 第2段階の次段階展開判定ロジックが実行されたことを確認
    // 判定基準:
    // - 精度率 >= 推奨精度閾値（94.8 >= 88）✓
    // - 精度向上度 >= 5% (5.33 >= 5) ✓
    // - 処理時間削減 >= 5% (12.5 >= 5) ✓
    // - 満足度向上 >= 3% (4.76 >= 3) ✓
    // → 次段階展開判定 = "PROCEED_TO_NEXT_STAGE"
    expect(stage2Result.nextStageDeploymentDecision).toBe('PROCEED_TO_NEXT_STAGE');

    // 判定根拠をシステムログに記録
    expect(stage2Result.deploymentDecisionRationale).toEqual({
      accuracyMet: true,
      accuracyThreshold: 88,
      accuracyActual: 94.8,
      improvementRateMet: true,
      improvementThreshold: 5,
      improvementActual: 5.33,
      processingTimeSavingsMet: true,
      processingTimeSavingsThreshold: 5,
      processingTimeSavingsActual: 12.5,
      userSatisfactionMet: true,
      userSatisfactionThreshold: 3,
      userSatisfactionActual: 4.76,
    });

    // ===== 検証: 第2段階の定量値と判定根拠がデータベースに記録されたことを確認
    expect(stage2Result.persistenceStatus).toBe('RECORDED_TO_DB');
    expect(stage2Result.recordId).toMatch(/^stage-2-verify-\d{13}$/);
    expect(stage2Result.algorithmVersionId).toBe('algo-v2-stage2');

    // ===== 検証: 複数段階の定量値と判定根拠の整合性
    // 第1段階から第2段階への精度向上: 90 -> 94.8
    expect(stage2Result.calculatedAccuracyRatePercent).toBeGreaterThan(
      stage1Result.calculatedAccuracyRatePercent
    );

    // 第1段階から第2段階への処理時間短縮: 7.69% -> 12.5%
    expect(stage2Result.processingTimeReductionPercent).toBeGreaterThan(
      stage1Result.processingTimeReductionPercent
    );

    // 第1段階から第2段階への満足度向上: 7.69% -> 4.76%
    // (第2段階はベースが高いため絶対値は低いが、総合満足度は向上)
    expect(stage2Result.userSatisfactionScoreAvg).toBeGreaterThan(
      stage1Input.referenceMetricsFromPreviousCycle.userSatisfactionScoreAvg
    );

    // ===== 検証: 判定根拠がログおよびレポートに正確に記録されていることを確認
    expect(stage2Result.auditLogEntry).toBeDefined();
    expect(stage2Result.auditLogEntry).toHaveProperty('stageNumber', 2);
    expect(stage2Result.auditLogEntry).toHaveProperty(
      'decision',
      'PROCEED_TO_NEXT_STAGE'
    );
    expect(stage2Result.auditLogEntry).toHaveProperty('recordedAtUtc');
    expect(stage2Result.auditLogEntry.recordedAtUtc).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // ===== 検証: 複数段階のレポート生成
    const report = {
      stages: [
        {
          stageNumber: stage1Result.stageNumber,
          accuracyRatePercent: stage1Result.calculatedAccuracyRatePercent,
          improvementPercent: stage1Result.accuracyImprovementRatePercent,
          decision: stage1Result.nextStageDeploymentDecision,
          rationale: stage1Result.deploymentDecisionRationale,
        },
        {
          stageNumber: stage2Result.stageNumber,
          accuracyRatePercent: stage2Result.calculatedAccuracyRatePercent,
          improvementPercent: stage2Result.accuracyImprovementRatePercent,
          decision: stage2Result.nextStageDeploymentDecision,
          rationale: stage2Result.deploymentDecisionRationale,
        },
      ],
      generatedAtUtc: new Date('2024-01-22T14:30:00Z').toISOString(),
    };

    // レポートに段階별 정량值이 정확하게 반영되었는지 확인
    expect(report.stages).toHaveLength(2);
    expect(report.stages[0].stageNumber).toBe(1);
    expect(report.stages[0].accuracyRatePercent).toBe(90);
    expect(report.stages[0].decision).toBe('PROCEED_TO_NEXT_STAGE');
    expect(report.stages[1].stageNumber).toBe(2);
    expect(report.stages[1].accuracyRatePercent).toBeCloseTo(94.8, 1);
    expect(report.stages[1].decision).toBe('PROCEED_TO_NEXT_STAGE');

    // 각 단계의 판정 근거가 일관성 있게 기록되었는지 확인
    expect(report.stages[0].rationale.accuracyMet).toBe(true);
    expect(report.stages[0].rationale.improvementRateMet).toBe(true);
    expect(report.stages[1].rationale.accuracyMet).toBe(true);
    expect(report.stages[1].rationale.improvementRateMet).toBe(true);

    // ===== 최종 검증: 단계별 정량값과 판정 근거의 추적 가능성
    expect(stage1Result.stageNumber).toBe(1);
    expect(stage2Result.stageNumber).toBe(2);

    // 각 단계의 기록 ID가 고유한지 확인
    expect(stage1Result.recordId).not.toEqual(stage2Result.recordId);

    // 각 단계의 알고리즘 버전 ID가 다른지 확인
    expect(stage1Result.algorithmVersionId).not.toEqual(
      stage2Result.algorithmVersionId
    );

    // 결과의 전체 필드 존재 확인
    expect(stage1Result).toHaveProperty('calculatedAccuracyRatePercent');
    expect(stage1Result).toHaveProperty('accuracyImprovementRatePercent');
    expect(stage1Result).toHaveProperty('processingTimeReductionPercent');
    expect(stage1Result).toHaveProperty('userSatisfactionImprovementPercent');
    expect(stage1Result).toHaveProperty('mealCompletionImprovementPercent');
    expect(stage1Result).toHaveProperty('rejectionRateImprovementPercent');
    expect(stage1Result).toHaveProperty('cookingTimeReductionPercent');
    expect(stage1Result).toHaveProperty('nextStageDeploymentDecision');
    expect(stage1Result).toHaveProperty('deploymentDecisionRationale');
    expect(stage1Result).toHaveProperty('persistenceStatus');
    expect(stage1Result).toHaveProperty('recordId');
    expect(stage1Result).toHaveProperty('recordedAtUtc');
    expect(stage1Result).toHaveProperty('auditLogEntry');
  });
});