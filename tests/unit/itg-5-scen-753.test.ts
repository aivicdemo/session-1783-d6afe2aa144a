import { determineAlgorithmImprovementJudgment } from '../../src/logic/it-7-2-1';

describe('Algorithm Improvement Judgment Dashboard', () => {
  // SCEN-753: [normal] アルゴリズム改善判定機能 - 予測精度が閾値未満の場合、改善実施と改善対象機能が決定される
  test('should determine improvement execution and target features when prediction accuracy is below threshold', () => {
    const input = {
      algorithmVersionId: 'algo-v2-001',
      predictionAccuracyThreshold: 80,
      currentPredictionAccuracy: 75,
      failurePatterns: [
        {
          categoryId: 'cat-nutrition',
          categoryName: 'nutritionBalanceImprovement',
          occurrenceCount: 12,
          priority: 1,
          impactScore: 85,
        },
        {
          categoryId: 'cat-preference',
          categoryName: 'familyPreferenceReflection',
          occurrenceCount: 8,
          priority: 2,
          impactScore: 72,
        },
        {
          categoryId: 'cat-cooking-time',
          categoryName: 'cookingTimeOptimization',
          occurrenceCount: 5,
          priority: 3,
          impactScore: 65,
        },
      ],
      improvementCandidates: [
        {
          improvementId: 'imp-001',
          improvementType: 'algorithmModification',
          estimatedEffectValue: 8,
          implementationDifficulty: 4,
          userImpactScore: 85,
        },
        {
          improvementId: 'imp-002',
          improvementType: 'parameterAdjustment',
          estimatedEffectValue: 5,
          implementationDifficulty: 2,
          userImpactScore: 72,
        },
        {
          improvementId: 'imp-003',
          improvementType: 'newFeature',
          estimatedEffectValue: 6,
          implementationDifficulty: 6,
          userImpactScore: 65,
        },
      ],
    };

    const result = determineAlgorithmImprovementJudgment(input);

    // 予測精度が閾値未満（75% < 80%）のため、改善実施フラグが true
    expect(result.improvementExecutionFlag).toBe(true);

    // 改善対象機能が自動決定された
    expect(result.targetImprovementFeatures).toBeDefined();
    expect(Array.isArray(result.targetImprovementFeatures)).toBe(true);
    expect(result.targetImprovementFeatures.length).toBeGreaterThan(0);

    // 最優先改善対象機能は improvementId 'imp-001' (estimatedEffect 8, userImpact 85)
    expect(result.targetImprovementFeatures[0].improvementId).toBe('imp-001');
    expect(result.targetImprovementFeatures[0].priority).toBe(1);
    expect(result.targetImprovementFeatures[0].improvementContent).toBe('algorithmModification');

    // 次順位は 'imp-002' (estimatedEffect 5, userImpact 72, lower difficulty)
    expect(result.targetImprovementFeatures[1].improvementId).toBe('imp-002');
    expect(result.targetImprovementFeatures[1].priority).toBe(2);
    expect(result.targetImprovementFeatures[1].improvementContent).toBe('parameterAdjustment');

    // 第3順位は 'imp-003' (estimatedEffect 6, userImpact 65, highest difficulty)
    expect(result.targetImprovementFeatures[2].improvementId).toBe('imp-003');
    expect(result.targetImprovementFeatures[2].priority).toBe(3);
    expect(result.targetImprovementFeatures[2].improvementContent).toBe('newFeature');

    // 改善対象機能の詳細情報が含まれている
    result.targetImprovementFeatures.forEach((feature) => {
      expect(feature).toHaveProperty('improvementId');
      expect(feature).toHaveProperty('priority');
      expect(feature).toHaveProperty('improvementContent');
      expect(typeof feature.priority).toBe('number');
      expect(feature.priority).toBeGreaterThanOrEqual(1);
    });

    // 精度改善差分が正確に計算されている（期待改善値の合計）
    const totalExpectedImprovement =
      result.targetImprovementFeatures[0].estimatedEffectValue +
      result.targetImprovementFeatures[1].estimatedEffectValue +
      result.targetImprovementFeatures[2].estimatedEffectValue;
    expect(totalExpectedImprovement).toBe(19);

    // 改善後予測精度が計算される（75% + 19% = 94%）
    const projectedAccuracy = input.currentPredictionAccuracy + totalExpectedImprovement;
    expect(projectedAccuracy).toBe(94);

    // 改善後予測精度が閾値を上回る
    expect(projectedAccuracy).toBeGreaterThan(input.predictionAccuracyThreshold);

    // 改善判定詳細情報
    expect(result.improvementJudgmentDetail).toBeDefined();
    expect(result.improvementJudgmentDetail.currentAccuracy).toBe(75);
    expect(result.improvementJudgmentDetail.accuracyThreshold).toBe(80);
    expect(result.improvementJudgmentDetail.accuracyGap).toBe(-5);
    expect(result.improvementJudgmentDetail.projectedAccuracyAfterImprovement).toBe(94);
    expect(result.improvementJudgmentDetail.improvementExecutionJustification).toBe('accuracyBelowThreshold');
  });
});