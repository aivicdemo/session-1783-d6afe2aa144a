import { detectAnomaliesInMealEvaluations } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-423
  test('[normal] 食事評価データ異常値検出機能 - 正常なデータセットで信頼度の高いデータが出力される', () => {
    const aggregated_evaluations = [
      {
        meal_id: 'meal_001',
        family_member_id: 'member_001',
        satisfaction_score: 5,
        completion_rate: 100,
        request: '塩辛さを減らしてほしい',
        timestamp: '2024-01-15T19:00:00Z',
      },
      {
        meal_id: 'meal_001',
        family_member_id: 'member_002',
        satisfaction_score: 4,
        completion_rate: 85,
        request: 'もっと野菜を使ってほしい',
        timestamp: '2024-01-15T19:05:00Z',
      },
      {
        meal_id: 'meal_001',
        family_member_id: 'member_003',
        satisfaction_score: 3,
        completion_rate: 60,
        request: null,
        timestamp: '2024-01-15T19:10:00Z',
      },
      {
        meal_id: 'meal_002',
        family_member_id: 'member_001',
        satisfaction_score: 2,
        completion_rate: 45,
        request: 'もう一度作ってほしい',
        timestamp: '2024-01-16T19:00:00Z',
      },
      {
        meal_id: 'meal_002',
        family_member_id: 'member_002',
        satisfaction_score: 1,
        completion_rate: 0,
        request: null,
        timestamp: '2024-01-16T19:05:00Z',
      },
    ];

    const result = detectAnomaliesInMealEvaluations(aggregated_evaluations);

    expect(result).toEqual({
      has_anomalies: false,
      trust_score: expect.any(Number),
      filtered_evaluations: aggregated_evaluations,
      anomaly_flags: [],
    });

    expect(result.trust_score).toBeGreaterThanOrEqual(0.85);
    expect(result.trust_score).toBeLessThanOrEqual(1.0);
    expect(result.has_anomalies).toBe(false);
    expect(result.filtered_evaluations.length).toBe(5);

    result.filtered_evaluations.forEach((evaluation: any) => {
      expect(evaluation.satisfaction_score).toBeGreaterThanOrEqual(1);
      expect(evaluation.satisfaction_score).toBeLessThanOrEqual(5);
      expect(evaluation.completion_rate).toBeGreaterThanOrEqual(0);
      expect(evaluation.completion_rate).toBeLessThanOrEqual(100);
      expect(evaluation).toHaveProperty('meal_id');
      expect(evaluation).toHaveProperty('family_member_id');
      expect(evaluation).toHaveProperty('timestamp');
    });

    expect(result.anomaly_flags).toEqual([]);
  });
});