import { calculateFeatureUsageFrequency } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析ダッシュボード', () => {
  // SCEN-385: [edge] 機能別使用パターン分析機能 - 離脱ポイントがないシナリオで使用頻度が0と判定される
  test('離脱ポイントがないシナリオで使用頻度が正の値として計算されること', () => {
    // 前提: ユーザーが機能内のすべてのステップを完了し、最終ステップまで到達するパターン
    const completionFlows = [
      {
        user_id: 'usr_001',
        feature_id: 'feat_nutrition_analysis',
        flow_id: 'flow_001',
        start_timestamp: new Date('2024-01-15T09:00:00Z'),
        end_timestamp: new Date('2024-01-15T09:15:00Z'),
        total_steps: 5,
        completed_steps: 5,
        abandonment_point: null,
        is_completed: true,
      },
      {
        user_id: 'usr_001',
        feature_id: 'feat_nutrition_analysis',
        flow_id: 'flow_002',
        start_timestamp: new Date('2024-01-16T10:00:00Z'),
        end_timestamp: new Date('2024-01-16T10:20:00Z'),
        total_steps: 5,
        completed_steps: 5,
        abandonment_point: null,
        is_completed: true,
      },
      {
        user_id: 'usr_002',
        feature_id: 'feat_nutrition_analysis',
        flow_id: 'flow_003',
        start_timestamp: new Date('2024-01-17T11:00:00Z'),
        end_timestamp: new Date('2024-01-17T11:10:00Z'),
        total_steps: 5,
        completed_steps: 5,
        abandonment_point: null,
        is_completed: true,
      },
    ];

    // 分析期間: 2024-01-15 ～ 2024-01-17
    const analysisStartDate = new Date('2024-01-15T00:00:00Z');
    const analysisEndDate = new Date('2024-01-17T23:59:59Z');

    // 機能の使用頻度の集計・分析処理を実行
    const result = calculateFeatureUsageFrequency({
      flows: completionFlows,
      feature_id: 'feat_nutrition_analysis',
      period_start: analysisStartDate,
      period_end: analysisEndDate,
    });

    // 期待結果: 離脱ポイントがないシナリオでは、完了パターンとして集計され、使用頻度が正の値として計算される
    // 離脱ポイントなし＝完全利用と判定され、使用頻度が最高値として計算される

    // アサーション1: 使用頻度が0ではなく、正の値であること
    expect(result.usage_frequency).toBeGreaterThan(0);

    // アサーション2: 完全完了パターンの回数が正しく集計されていること
    expect(result.completion_count).toBe(3);

    // アサーション3: 完全完了パターンのユーザー数が正しく集計されていること
    expect(result.unique_user_count).toBe(2);

    // アサーション4: 離脱ポイントがないフローが全て集計対象になっていること
    expect(result.total_flows_analyzed).toBe(3);

    // アサーション5: 離脱ポイント検出数が0であること
    expect(result.abandonment_point_count).toBe(0);

    // アサーション6: 完了率が100%であること
    expect(result.completion_rate).toBe(100);

    // アサーション7: 使用頻度スコアが最高値（100）に設定されていること
    // （完全完了パターンなので最高値の利用と判定される）
    expect(result.usage_frequency_score).toBe(100);

    // アサーション8: データの整合性が保たれていること（結果オブジェクトが期待される構造を持つこと）
    expect(result).toHaveProperty('usage_frequency');
    expect(result).toHaveProperty('completion_count');
    expect(result).toHaveProperty('unique_user_count');
    expect(result).toHaveProperty('total_flows_analyzed');
    expect(result).toHaveProperty('abandonment_point_count');
    expect(result).toHaveProperty('completion_rate');
    expect(result).toHaveProperty('usage_frequency_score');
    expect(result).toHaveProperty('analysis_period_start');
    expect(result).toHaveProperty('analysis_period_end');

    // アサーション9: 分析期間が正しく記録されていること
    expect(result.analysis_period_start).toEqual(analysisStartDate);
    expect(result.analysis_period_end).toEqual(analysisEndDate);

    // アサーション10: エラーが発生せず、結果が正常に返却されていること
    expect(result.error).toBeUndefined();
  });
});