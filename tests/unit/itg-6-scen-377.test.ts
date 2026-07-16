import {
  calculatePainQuantificationScore,
  calculateMarketEffectPrediction,
  calculateImplementationPriorityScore,
} from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード - 開発リソース配分・実装スケジュール承認判定', () => {
  // SCEN-377
  test('ペイン定量化スコアと市場効果予測値に基づいて実装優先度スコアが算出される', () => {
    // ペイン項目1: 調理時間短縮
    const pain_item_1_occurrence_frequency = 75;
    const pain_item_1_impact_level = 85;
    const pain_item_1_user_segment_size = 12000;

    const pain_item_1_quantification_score = calculatePainQuantificationScore({
      occurrence_frequency: pain_item_1_occurrence_frequency,
      impact_level: pain_item_1_impact_level,
      user_segment_size: pain_item_1_user_segment_size,
    });

    expect(pain_item_1_quantification_score).toBe(75.5);

    const pain_item_1_market_effect_prediction = calculateMarketEffectPrediction({
      pain_quantification_score: pain_item_1_quantification_score,
      competitive_gap_degree: 45,
      market_adoption_rate: 0.68,
    });

    expect(pain_item_1_market_effect_prediction).toBe(23.0);

    // ペイン項目2: 食材制限対応
    const pain_item_2_occurrence_frequency = 62;
    const pain_item_2_impact_level = 72;
    const pain_item_2_user_segment_size = 8500;

    const pain_item_2_quantification_score = calculatePainQuantificationScore({
      occurrence_frequency: pain_item_2_occurrence_frequency,
      impact_level: pain_item_2_impact_level,
      user_segment_size: pain_item_2_user_segment_size,
    });

    expect(pain_item_2_quantification_score).toBe(67.0);

    const pain_item_2_market_effect_prediction = calculateMarketEffectPrediction({
      pain_quantification_score: pain_item_2_quantification_score,
      competitive_gap_degree: 35,
      market_adoption_rate: 0.55,
    });

    expect(pain_item_2_market_effect_prediction).toBe(12.95);

    // ペイン項目3: 予算管理最適化
    const pain_item_3_occurrence_frequency = 51;
    const pain_item_3_impact_level = 68;
    const pain_item_3_user_segment_size = 6200;

    const pain_item_3_quantification_score = calculatePainQuantificationScore({
      occurrence_frequency: pain_item_3_occurrence_frequency,
      impact_level: pain_item_3_impact_level,
      user_segment_size: pain_item_3_user_segment_size,
    });

    expect(pain_item_3_quantification_score).toBe(59.5);

    const pain_item_3_market_effect_prediction = calculateMarketEffectPrediction({
      pain_quantification_score: pain_item_3_quantification_score,
      competitive_gap_degree: 28,
      market_adoption_rate: 0.42,
    });

    expect(pain_item_3_market_effect_prediction).toBe(7.01);

    // 実装優先度スコア算出
    const implementation_priority_score_1 = calculateImplementationPriorityScore({
      pain_quantification_score: pain_item_1_quantification_score,
      market_effect_prediction: pain_item_1_market_effect_prediction,
      implementation_difficulty: 3,
      resource_availability: 0.8,
    });

    expect(implementation_priority_score_1).toBe(82.4);

    const implementation_priority_score_2 = calculateImplementationPriorityScore({
      pain_quantification_score: pain_item_2_quantification_score,
      market_effect_prediction: pain_item_2_market_effect_prediction,
      implementation_difficulty: 2,
      resource_availability: 0.85,
    });

    expect(implementation_priority_score_2).toBe(68.31);

    const implementation_priority_score_3 = calculateImplementationPriorityScore({
      pain_quantification_score: pain_item_3_quantification_score,
      market_effect_prediction: pain_item_3_market_effect_prediction,
      implementation_difficulty: 4,
      resource_availability: 0.7,
    });

    expect(implementation_priority_score_3).toBe(45.24);

    // 優先度スコアが数値型であることを検証
    expect(typeof implementation_priority_score_1).toBe('number');
    expect(typeof implementation_priority_score_2).toBe('number');
    expect(typeof implementation_priority_score_3).toBe('number');

    // スコアが許容範囲内（0～100）であることを検証
    expect(implementation_priority_score_1).toBeGreaterThanOrEqual(0);
    expect(implementation_priority_score_1).toBeLessThanOrEqual(100);
    expect(implementation_priority_score_2).toBeGreaterThanOrEqual(0);
    expect(implementation_priority_score_2).toBeLessThanOrEqual(100);
    expect(implementation_priority_score_3).toBeGreaterThanOrEqual(0);
    expect(implementation_priority_score_3).toBeLessThanOrEqual(100);

    // 優先度スコアの大小関係が正しく反映されていることを確認
    expect(implementation_priority_score_1).toBeGreaterThan(implementation_priority_score_2);
    expect(implementation_priority_score_2).toBeGreaterThan(implementation_priority_score_3);

    // 複数ペイン項目を優先度順でソート
    const priority_scores = [
      { pain_name: 'cooking_time_reduction', score: implementation_priority_score_1 },
      { pain_name: 'food_restriction_support', score: implementation_priority_score_2 },
      { pain_name: 'budget_optimization', score: implementation_priority_score_3 },
    ];

    const sorted_scores = priority_scores.sort((a, b) => b.score - a.score);

    expect(sorted_scores[0].pain_name).toBe('cooking_time_reduction');
    expect(sorted_scores[0].score).toBe(82.4);
    expect(sorted_scores[1].pain_name).toBe('food_restriction_support');
    expect(sorted_scores[1].score).toBe(68.31);
    expect(sorted_scores[2].pain_name).toBe('budget_optimization');
    expect(sorted_scores[2].score).toBe(45.24);
  });
});