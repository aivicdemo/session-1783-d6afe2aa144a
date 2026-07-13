import { describe, test, expect } from '@jest/globals';
import { validateAlgorithmImprovement } from '../../src/logic/it-1-br-2-1-1-1';

describe('アルゴリズム改善成功判定・次優先度決定', () => {
  // SCEN-590
  test('改善後の成功率が最小閾値未満の場合にエラーが返される', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v2_20240115',
      improvement_type: 'nutritional_balance',
      success_rate_before: 0.75,
      success_rate_after: 0.68,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: 5,
      user_satisfaction_score_after: 78,
      sample_size: 150,
      test_period_start_date: '2024-01-08T00:00:00Z',
      test_period_end_date: '2024-01-14T23:59:59Z',
    };

    expect(() => {
      validateAlgorithmImprovement(improvement_input);
    }).toThrow(/最小閾値/);
  });

  // 境界値テスト: 成功率が最小閾値と同じ場合（合格）
  test('改善後の成功率が最小閾値と同じ場合は成功する', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v2_20240115',
      improvement_type: 'nutritional_balance',
      success_rate_before: 0.75,
      success_rate_after: 0.70,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: 5,
      user_satisfaction_score_after: 78,
      sample_size: 150,
      test_period_start_date: '2024-01-08T00:00:00Z',
      test_period_end_date: '2024-01-14T23:59:59Z',
    };

    const result = validateAlgorithmImprovement(improvement_input);
    expect(result).toEqual({
      is_approved: true,
      success_rate_achieved: 0.70,
      improvement_margin: -0.05,
      next_priority_rank: 'MEDIUM',
      recommendation: 'アルゴリズムを段階的ロールアウト対象に組み込み',
    });
  });

  // ハッピーパス: 成功率が最小閾値を十分に超える場合
  test('改善後の成功率が最小閾値を超える場合は成功し優先度を決定する', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v3_20240122',
      improvement_type: 'family_preference_reflection',
      success_rate_before: 0.72,
      success_rate_after: 0.82,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: 12,
      user_satisfaction_score_after: 85,
      sample_size: 180,
      test_period_start_date: '2024-01-15T00:00:00Z',
      test_period_end_date: '2024-01-21T23:59:59Z',
    };

    const result = validateAlgorithmImprovement(improvement_input);
    expect(result).toEqual({
      is_approved: true,
      success_rate_achieved: 0.82,
      improvement_margin: 0.10,
      next_priority_rank: 'HIGH',
      recommendation: '次スプリントに優先実装',
    });
  });

  // 境界値テスト: 成功率がギリギリ不足
  test('改善後の成功率が最小閾値をわずかに下回る場合にエラーが返される', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v2_revised_20240129',
      improvement_type: 'cooking_time_constraint',
      success_rate_before: 0.70,
      success_rate_after: 0.6999,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: 2,
      user_satisfaction_score_after: 72,
      sample_size: 120,
      test_period_start_date: '2024-01-22T00:00:00Z',
      test_period_end_date: '2024-01-28T23:59:59Z',
    };

    expect(() => {
      validateAlgorithmImprovement(improvement_input);
    }).toThrow(/最小閾値/);
  });

  // ハッピーパス: 大幅改善の場合
  test('改善後の成功率が大幅に向上する場合は最高優先度で決定される', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v4_major_20240205',
      improvement_type: 'allergy_and_restriction_handling',
      success_rate_before: 0.65,
      success_rate_after: 0.88,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: 18,
      user_satisfaction_score_after: 91,
      sample_size: 220,
      test_period_start_date: '2024-01-29T00:00:00Z',
      test_period_end_date: '2024-02-04T23:59:59Z',
    };

    const result = validateAlgorithmImprovement(improvement_input);
    expect(result).toEqual({
      is_approved: true,
      success_rate_achieved: 0.88,
      improvement_margin: 0.23,
      next_priority_rank: 'CRITICAL',
      recommendation: '即時全量展開を検討',
    });
  });

  // エラーテスト: 成功率が著しく低い場合
  test('改善後の成功率が大幅に低下する場合にエラーが返される', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v2_experimental_20240212',
      improvement_type: 'budget_constraint_optimization',
      success_rate_before: 0.78,
      success_rate_after: 0.55,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: -3,
      user_satisfaction_score_after: 62,
      sample_size: 140,
      test_period_start_date: '2024-02-05T00:00:00Z',
      test_period_end_date: '2024-02-11T23:59:59Z',
    };

    expect(() => {
      validateAlgorithmImprovement(improvement_input);
    }).toThrow(/最小閾値/);
  });

  // ハッピーパス: 通常の改善ケース
  test('改善後の成功率が最小閾値を適度に上回る場合は中優先度で決定される', () => {
    const improvement_input = {
      algorithm_version_id: 'algo_v3_maintenance_20240219',
      improvement_type: 'nutrient_balance_tuning',
      success_rate_before: 0.73,
      success_rate_after: 0.76,
      success_rate_minimum_threshold: 0.70,
      cooking_time_reduction_minutes: 3,
      user_satisfaction_score_after: 79,
      sample_size: 160,
      test_period_start_date: '2024-02-12T00:00:00Z',
      test_period_end_date: '2024-02-18T23:59:59Z',
    };

    const result = validateAlgorithmImprovement(improvement_input);
    expect(result).toEqual({
      is_approved: true,
      success_rate_achieved: 0.76,
      improvement_margin: 0.03,
      next_priority_rank: 'MEDIUM',
      recommendation: 'アルゴリズムを段階的ロールアウト対象に組み込み',
    });
  });
});