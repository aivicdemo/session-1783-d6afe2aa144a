import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成ロジックの評価データ蓄積量反映機能', () => {
  // SCEN-559: [edge] 蓄積評価データの献立生成ロジック反映機能 - 評価データ蓄積量が反映閾値に達していない場合、前回のロジックが保持される
  test('should retain previous algorithm version when evaluation data volume is below reflection threshold', () => {
    const REFLECTION_THRESHOLD = 30;
    const PREVIOUS_ALGORITHM_VERSION = 'v2.1.0-hash-abc123def456';
    const PREVIOUS_ALGORITHM_HASH = 'abc123def456';

    const evaluationDataBelowThreshold = Array.from({ length: 25 }, (_, i) => ({
      mealId: `meal_${i + 1}`,
      userId: 'user_primary_household',
      satisfactionScore: 4.2 + (i % 3) * 0.1,
      completionRate: 0.85 + (i % 5) * 0.03,
      feedbackRequestText: `Good meal option ${i + 1}`,
      recordedAt: new Date(`2024-01-${String((i % 28) + 1).padStart(2, '0')}T19:30:00Z`).toISOString(),
    }));

    const previousAlgorithmState = {
      algorithmVersion: PREVIOUS_ALGORITHM_VERSION,
      algorithmHash: PREVIOUS_ALGORITHM_HASH,
      appliedAt: '2024-01-08T09:00:00Z',
      dataVolumeAtApplication: 28,
    };

    const systemState = {
      currentAlgorithmVersion: PREVIOUS_ALGORITHM_VERSION,
      currentAlgorithmHash: PREVIOUS_ALGORITHM_HASH,
      accumulatedEvaluationDataCount: 25,
      lastAlgorithmUpdateTimestamp: '2024-01-08T09:00:00Z',
      reflectionThreshold: REFLECTION_THRESHOLD,
    };

    const result = aggregateWeeklyMetrics({
      evaluationDataRecords: evaluationDataBelowThreshold,
      previousAlgorithmVersion: PREVIOUS_ALGORITHM_VERSION,
      previousAlgorithmHash: PREVIOUS_ALGORITHM_HASH,
      reflectionThreshold: REFLECTION_THRESHOLD,
      currentAlgorithmState: systemState,
    });

    expect(result.algorithmVersionRetained).toBe(true);
    expect(result.currentAlgorithmVersion).toBe(PREVIOUS_ALGORITHM_VERSION);
    expect(result.currentAlgorithmHash).toBe(PREVIOUS_ALGORITHM_HASH);
    expect(result.accumulatedEvaluationDataCount).toBe(25);
    expect(result.isReflectionThresholdMet).toBe(false);
    expect(result.algorithmUpdateExecuted).toBe(false);
    expect(result.logEntry).toEqual({
      timestamp: expect.any(String),
      status: 'algorithm_retained',
      reason: 'evaluation_data_below_threshold',
      accumulatedDataCount: 25,
      threshold: REFLECTION_THRESHOLD,
      retainedVersion: PREVIOUS_ALGORITHM_VERSION,
      retainedHash: PREVIOUS_ALGORITHM_HASH,
    });

    expect(result.logEntry.accumulatedDataCount).toBeLessThan(
      result.logEntry.threshold
    );
    expect(result.currentAlgorithmVersion).toEqual(previousAlgorithmState.algorithmVersion);
  });
});