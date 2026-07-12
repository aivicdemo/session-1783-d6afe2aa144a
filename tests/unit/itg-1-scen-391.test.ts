import { validatePredictionAccuracyAnalysis } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-391: [normal] 需要予測精度検証機能 - 予測精度低下要因が複数特定される場合、改善優先度が重要度順にランク付けされる
  test('複数の予測精度低下要因が重要度スコア順にランク付けされる', () => {
    const predictionData = {
      prediction_id: 'pred_001',
      predicted_demand: 150,
      actual_demand: 120,
      prediction_date: '2024-01-15',
      analysis_period_start: '2024-01-01',
      analysis_period_end: '2024-01-31',
    };

    const lowAccuracyFactors = [
      {
        factor_id: 'factor_001',
        factor_name: '季節性未考慮',
        importance_score: 85,
        impact_magnitude: 0.25,
        affected_prediction_count: 12,
        recommended_actions: [
          {
            action_id: 'action_001',
            action_name: '季節指数パラメータ追加',
            estimated_accuracy_improvement: 0.15,
            implementation_complexity: 3,
          },
          {
            action_id: 'action_002',
            action_name: '過去3年の季節パターン学習',
            estimated_accuracy_improvement: 0.12,
            implementation_complexity: 2,
          },
        ],
      },
      {
        factor_id: 'factor_002',
        factor_name: '外部イベント影響',
        importance_score: 72,
        impact_magnitude: 0.18,
        affected_prediction_count: 8,
        recommended_actions: [
          {
            action_id: 'action_003',
            action_name: 'イベント情報API統合',
            estimated_accuracy_improvement: 0.10,
            implementation_complexity: 4,
          },
        ],
      },
      {
        factor_id: 'factor_003',
        factor_name: 'データ欠損',
        importance_score: 68,
        impact_magnitude: 0.12,
        affected_prediction_count: 5,
        recommended_actions: [
          {
            action_id: 'action_004',
            action_name: '欠損値補完アルゴリズム導入',
            estimated_accuracy_improvement: 0.08,
            implementation_complexity: 2,
          },
        ],
      },
      {
        factor_id: 'factor_004',
        factor_name: '競合店舗施策の未反映',
        importance_score: 55,
        impact_magnitude: 0.09,
        affected_prediction_count: 3,
        recommended_actions: [
          {
            action_id: 'action_005',
            action_name: '競合施策モニタリング機能追加',
            estimated_accuracy_improvement: 0.06,
            implementation_complexity: 5,
          },
        ],
      },
    ];

    const result = validatePredictionAccuracyAnalysis({
      prediction_data: predictionData,
      low_accuracy_factors: lowAccuracyFactors,
    });

    // 検出された要因数が3件以上であることを検証
    expect(result.detected_factors_count).toBe(4);

    // 改善優先度ランキングが重要度スコアの高い順（降順）に並べられていることを検証
    expect(result.ranked_factors).toEqual([
      {
        rank: 1,
        factor_id: 'factor_001',
        factor_name: '季節性未考慮',
        importance_score: 85,
        improvement_priority_rank: 'High',
      },
      {
        rank: 2,
        factor_id: 'factor_002',
        factor_name: '外部イベント影響',
        importance_score: 72,
        improvement_priority_rank: 'High',
      },
      {
        rank: 3,
        factor_id: 'factor_003',
        factor_name: 'データ欠損',
        importance_score: 68,
        improvement_priority_rank: 'Medium',
      },
      {
        rank: 4,
        factor_id: 'factor_004',
        factor_name: '競合店舗施策の未反映',
        importance_score: 55,
        improvement_priority_rank: 'Medium',
      },
    ]);

    // 各要因に紐付く推奨改善アクションが優先度順に列挙されていることを検証
    expect(result.recommended_actions_by_factor).toEqual({
      factor_001: [
        {
          rank: 1,
          action_id: 'action_001',
          action_name: '季節指数パラメータ追加',
          estimated_accuracy_improvement: 0.15,
          implementation_complexity: 3,
        },
        {
          rank: 2,
          action_id: 'action_002',
          action_name: '過去3年の季節パターン学習',
          estimated_accuracy_improvement: 0.12,
          implementation_complexity: 2,
        },
      ],
      factor_002: [
        {
          rank: 1,
          action_id: 'action_003',
          action_name: 'イベント情報API統合',
          estimated_accuracy_improvement: 0.10,
          implementation_complexity: 4,
        },
      ],
      factor_003: [
        {
          rank: 1,
          action_id: 'action_004',
          action_name: '欠損値補完アルゴリズム導入',
          estimated_accuracy_improvement: 0.08,
          implementation_complexity: 2,
        },
      ],
      factor_004: [
        {
          rank: 1,
          action_id: 'action_005',
          action_name: '競合施策モニタリング機能追加',
          estimated_accuracy_improvement: 0.06,
          implementation_complexity: 5,
        },
      ],
    });

    // 全体的な精度改善見込み値が計算されていることを検証
    // (0.15 + 0.12 + 0.10 + 0.08 + 0.06 = 0.51)
    expect(result.total_estimated_accuracy_improvement).toBe(0.51);

    // エクスポート形式でランキング順序が保持されていることを検証
    expect(result.export_data).toEqual({
      export_format: 'json',
      export_timestamp: '2024-01-15T00:00:00Z',
      ranked_factors_preserved: true,
      factor_count: 4,
      top_factor: {
        rank: 1,
        factor_name: '季節性未考慮',
        importance_score: 85,
      },
    });

    // ランキング結果の妥当性を総合検証
    expect(result.ranking_validation_passed).toBe(true);
    expect(result.all_factors_ranked).toBe(true);
    expect(result.priority_order_correct).toBe(true);
  });
});