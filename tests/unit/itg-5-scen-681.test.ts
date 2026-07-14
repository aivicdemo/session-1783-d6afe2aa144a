import { calculateNutrientDeviation } from '../../src/logic/it-7-2-1';

describe('栄養項目別乖離度定量化ダッシュボード', () => {
  // SCEN-681
  test('栄養項目別の乖離度を定量化し改善優先度スコアを正しく算出する', () => {
    const nutrient_items = [
      {
        nutrient_id: 'protein',
        nutrient_name: 'タンパク質',
        target_value: 60,
        actual_value: 48,
      },
      {
        nutrient_id: 'fat',
        nutrient_name: '脂質',
        target_value: 50,
        actual_value: 55,
      },
      {
        nutrient_id: 'carbs',
        nutrient_name: '炭水化物',
        target_value: 300,
        actual_value: 250,
      },
      {
        nutrient_id: 'vitaminA',
        nutrient_name: 'ビタミンA',
        target_value: 800,
        actual_value: 600,
      },
    ];

    const result = calculateNutrientDeviation({
      nutrient_items,
    });

    // タンパク質: |48 - 60| / 60 × 100 = 20.0%
    expect(result.deviations[0]).toEqual({
      nutrient_id: 'protein',
      nutrient_name: 'タンパク質',
      target_value: 60,
      actual_value: 48,
      deviation_percent: 20.0,
      priority_score: 75,
      priority_rank: 1,
    });

    // 脂質: |55 - 50| / 50 × 100 = 10.0%
    expect(result.deviations[1]).toEqual({
      nutrient_id: 'fat',
      nutrient_name: '脂質',
      target_value: 50,
      actual_value: 55,
      deviation_percent: 10.0,
      priority_score: 40,
      priority_rank: 3,
    });

    // 炭水化物: |250 - 300| / 300 × 100 = 16.67%
    expect(result.deviations[2]).toEqual({
      nutrient_id: 'carbs',
      nutrient_name: '炭水化物',
      target_value: 300,
      actual_value: 250,
      deviation_percent: 16.67,
      priority_score: 63,
      priority_rank: 2,
    });

    // ビタミンA: |600 - 800| / 800 × 100 = 25.0%
    expect(result.deviations[3]).toEqual({
      nutrient_id: 'vitaminA',
      nutrient_name: 'ビタミンA',
      target_value: 800,
      actual_value: 600,
      deviation_percent: 25.0,
      priority_score: 90,
      priority_rank: 1,
    });

    // ランキング結果の検証: 優先度スコアが高い順にソートされていることを確認
    const ranked_list = result.deviations.sort(
      (a, b) => b.priority_score - a.priority_score
    );
    expect(ranked_list[0].nutrient_id).toBe('vitaminA');
    expect(ranked_list[0].priority_score).toBe(90);
    expect(ranked_list[1].nutrient_id).toBe('protein');
    expect(ranked_list[1].priority_score).toBe(75);
    expect(ranked_list[2].nutrient_id).toBe('carbs');
    expect(ranked_list[2].priority_score).toBe(63);
    expect(ranked_list[3].nutrient_id).toBe('fat');
    expect(ranked_list[3].priority_score).toBe(40);

    // 複数シナリオでの一貫性検証
    const scenario2_items = [
      {
        nutrient_id: 'calcium',
        nutrient_name: 'カルシウム',
        target_value: 1000,
        actual_value: 700,
      },
      {
        nutrient_id: 'iron',
        nutrient_name: '鉄',
        target_value: 10,
        actual_value: 8,
      },
    ];

    const result2 = calculateNutrientDeviation({
      nutrient_items: scenario2_items,
    });

    // カルシウム: |700 - 1000| / 1000 × 100 = 30.0%
    expect(result2.deviations[0]).toEqual({
      nutrient_id: 'calcium',
      nutrient_name: 'カルシウム',
      target_value: 1000,
      actual_value: 700,
      deviation_percent: 30.0,
      priority_score: 100,
      priority_rank: 1,
    });

    // 鉄: |8 - 10| / 10 × 100 = 20.0%
    expect(result2.deviations[1]).toEqual({
      nutrient_id: 'iron',
      nutrient_name: '鉄',
      target_value: 10,
      actual_value: 8,
      deviation_percent: 20.0,
      priority_score: 75,
      priority_rank: 2,
    });

    // 優先度スコアが高いほど優先度ランクが低い数字になっていることを確認
    expect(result2.deviations[0].priority_rank).toBe(1);
    expect(result2.deviations[1].priority_rank).toBe(2);

    // 全体集計結果の検証
    expect(result.total_items_analyzed).toBe(4);
    expect(result2.total_items_analyzed).toBe(2);
    expect(result.average_deviation_percent).toBeCloseTo(18.17, 2);
    expect(result.max_deviation_percent).toBe(25.0);
    expect(result.min_deviation_percent).toBe(10.0);
  });
});