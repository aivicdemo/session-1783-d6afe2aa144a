import { calculateDivergenceAnalysis } from '../../src/logic/it-7-2-1';

describe('需要予測精度の乖離分析機能 - 乖離分析結果から改善提案自動生成', () => {
  test('SCEN-588: 乖離分析実行時に複数の改善提案が優先度付きで自動生成される', () => {
    // 準備: 過去の予測データと実績データ
    const prediction_forecast_data = [
      { item_id: 1, item_name: '牛乳', forecast_quantity: 100, forecast_date: '2024-01-01' },
      { item_id: 2, item_name: 'パン', forecast_quantity: 80, forecast_date: '2024-01-01' },
      { item_id: 3, item_name: '卵', forecast_quantity: 60, forecast_date: '2024-01-01' },
      { item_id: 4, item_name: 'チーズ', forecast_quantity: 40, forecast_date: '2024-01-01' },
    ];

    const prediction_actual_data = [
      { item_id: 1, item_name: '牛乳', actual_quantity: 150, actual_date: '2024-01-01' },
      { item_id: 2, item_name: 'パン', actual_quantity: 60, actual_date: '2024-01-01' },
      { item_id: 3, item_name: '卵', actual_quantity: 90, actual_date: '2024-01-01' },
      { item_id: 4, item_name: 'チーズ', actual_quantity: 30, actual_date: '2024-01-01' },
    ];

    // 実行: 乖離分析を実行
    const result = calculateDivergenceAnalysis({
      forecast_data: prediction_forecast_data,
      actual_data: prediction_actual_data,
    });

    // 検証1: 改善提案が複数生成されていること
    expect(result.improvement_suggestions).toBeDefined();
    expect(Array.isArray(result.improvement_suggestions)).toBe(true);
    expect(result.improvement_suggestions.length).toBeGreaterThan(0);

    // 検証2: 各提案に根拠となる乖離要因が明記されていること
    result.improvement_suggestions.forEach((suggestion) => {
      expect(suggestion.divergence_factor).toBeDefined();
      expect(typeof suggestion.divergence_factor).toBe('string');
      expect(suggestion.divergence_factor.length).toBeGreaterThan(0);
    });

    // 検証3: 提案ごとに優先度（高/中/低）が割り当てられていること
    result.improvement_suggestions.forEach((suggestion) => {
      expect(suggestion.priority).toBeDefined();
      expect(['高', '中', '低']).toContain(suggestion.priority);
    });

    // 検証4: 改善実施時の期待効果が数値またはパーセンテージで示されていること
    result.improvement_suggestions.forEach((suggestion) => {
      expect(suggestion.expected_effect).toBeDefined();
      expect(typeof suggestion.expected_effect).toBe('number');
      expect(suggestion.expected_effect).toBeGreaterThanOrEqual(0);
      expect(suggestion.expected_effect).toBeLessThanOrEqual(100);
    });

    // 検証5: 具体的な改善提案内容を確認
    // 牛乳: 乖離率 = (150-100)/100 * 100 = 50% → 高優先度
    const milk_suggestion = result.improvement_suggestions.find(
      (s) => s.item_id === 1
    );
    expect(milk_suggestion).toBeDefined();
    expect(milk_suggestion?.priority).toBe('高');
    expect(milk_suggestion?.divergence_rate).toBe(50);

    // パン: 乖離率 = (60-80)/80 * 100 = -25% → 中優先度
    const bread_suggestion = result.improvement_suggestions.find(
      (s) => s.item_id === 2
    );
    expect(bread_suggestion).toBeDefined();
    expect(bread_suggestion?.priority).toBe('中');
    expect(bread_suggestion?.divergence_rate).toBe(-25);

    // 卵: 乖離率 = (90-60)/60 * 100 = 50% → 高優先度
    const egg_suggestion = result.improvement_suggestions.find(
      (s) => s.item_id === 3
    );
    expect(egg_suggestion).toBeDefined();
    expect(egg_suggestion?.priority).toBe('高');
    expect(egg_suggestion?.divergence_rate).toBe(50);

    // チーズ: 乖離率 = (30-40)/40 * 100 = -25% → 中優先度
    const cheese_suggestion = result.improvement_suggestions.find(
      (s) => s.item_id === 4
    );
    expect(cheese_suggestion).toBeDefined();
    expect(cheese_suggestion?.priority).toBe('中');
    expect(cheese_suggestion?.divergence_rate).toBe(-25);

    // 検証6: 提案が乖離率の大きい項目から優先度順に並べられていること
    const sorted_suggestions = result.improvement_suggestions.slice().sort((a, b) => {
      const priority_order = { 高: 1, 中: 2, 低: 3 };
      return (priority_order[a.priority as keyof typeof priority_order] || 999) -
             (priority_order[b.priority as keyof typeof priority_order] || 999);
    });
    
    result.improvement_suggestions.forEach((suggestion, index) => {
      expect(suggestion).toEqual(sorted_suggestions[index]);
    });

    // 検証7: データ形式が正しくシステムに保存可能な状態であること（JSON構造化）
    expect(() => {
      JSON.stringify(result.improvement_suggestions);
    }).not.toThrow(/JSON/);

    const json_str = JSON.stringify(result.improvement_suggestions);
    expect(json_str.length).toBeGreaterThan(0);

    // 再パース可能であることを確認
    const reparsed = JSON.parse(json_str);
    expect(Array.isArray(reparsed)).toBe(true);
    expect(reparsed.length).toBe(result.improvement_suggestions.length);

    // 検証8: 各提案に必須フィールドがすべて揃っていること
    result.improvement_suggestions.forEach((suggestion) => {
      expect(suggestion.item_id).toBeDefined();
      expect(typeof suggestion.item_id).toBe('number');
      expect(suggestion.item_name).toBeDefined();
      expect(typeof suggestion.item_name).toBe('string');
      expect(suggestion.divergence_rate).toBeDefined();
      expect(typeof suggestion.divergence_rate).toBe('number');
      expect(suggestion.divergence_factor).toBeDefined();
      expect(suggestion.priority).toBeDefined();
      expect(suggestion.expected_effect).toBeDefined();
      expect(typeof suggestion.expected_effect).toBe('number');
    });

    // 検証9: 全体的な分析結果メタデータ
    expect(result.analysis_timestamp).toBeDefined();
    expect(result.total_items_analyzed).toBe(4);
    expect(result.high_priority_count).toBe(2);
    expect(result.medium_priority_count).toBe(2);
    expect(result.low_priority_count).toBe(0);
  });
});