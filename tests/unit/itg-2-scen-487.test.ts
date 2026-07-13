import { calculateNutrientDeviation } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データ自動集計・達成度可視化ダッシュボード', () => {
  // SCEN-487: [normal] 乖離度定量化 - 栄養項目ごとに目標値との乖離度を正確に定量化する
  test('栄養項目ごとに目標値との乖離度を正確に定量化し、複数項目について独立した計算結果を返す', () => {
    // 前提: 栄養管理・分析ダッシュボードにログイン済み、栄養データと目標値が設定されている
    // 入力データ: タンパク質、炭水化物、脂質、ビタミンA、カルシウムの実績値と目標値
    const nutrient_data = {
      items: [
        {
          nutrient_id: 'protein_001',
          nutrient_name: 'タンパク質',
          actual_value: 55.5,
          target_value: 60.0,
          unit: 'g'
        },
        {
          nutrient_id: 'carbs_001',
          nutrient_name: '炭水化物',
          actual_value: 280.0,
          target_value: 300.0,
          unit: 'g'
        },
        {
          nutrient_id: 'fat_001',
          nutrient_name: '脂質',
          actual_value: 62.5,
          target_value: 60.0,
          unit: 'g'
        },
        {
          nutrient_id: 'vitaminA_001',
          nutrient_name: 'ビタミンA',
          actual_value: 720.0,
          target_value: 800.0,
          unit: 'μg'
        },
        {
          nutrient_id: 'calcium_001',
          nutrient_name: 'カルシウム',
          actual_value: 920.0,
          target_value: 1000.0,
          unit: 'mg'
        }
      ],
      measurement_date: '2024-01-15'
    };

    // 実行: 乖離度定量化機能を実行
    const result = calculateNutrientDeviation(nutrient_data);

    // 検証1: 戻り値の構造が正しい
    expect(result).toBeDefined();
    expect(result.measurement_date).toBe('2024-01-15');
    expect(result.deviation_results).toBeDefined();
    expect(Array.isArray(result.deviation_results)).toBe(true);
    expect(result.deviation_results.length).toBe(5);

    // 検証2: タンパク質の乖離度を検証
    // 計算式: (実績値 - 目標値) / 目標値 × 100 = (55.5 - 60.0) / 60.0 × 100 = -7.5
    const protein_result = result.deviation_results.find((item: any) => item.nutrient_id === 'protein_001');
    expect(protein_result).toBeDefined();
    expect(protein_result.nutrient_name).toBe('タンパク質');
    expect(protein_result.actual_value).toBe(55.5);
    expect(protein_result.target_value).toBe(60.0);
    expect(protein_result.deviation_percentage).toBe(-7.5);
    expect(protein_result.unit).toBe('g');

    // 検証3: 炭水化物の乖離度を検証
    // 計算式: (280.0 - 300.0) / 300.0 × 100 = -6.67 (小数第2位まで)
    const carbs_result = result.deviation_results.find((item: any) => item.nutrient_id === 'carbs_001');
    expect(carbs_result).toBeDefined();
    expect(carbs_result.nutrient_name).toBe('炭水化物');
    expect(carbs_result.actual_value).toBe(280.0);
    expect(carbs_result.target_value).toBe(300.0);
    expect(Math.round(carbs_result.deviation_percentage * 100) / 100).toBe(-6.67);

    // 検証4: 脂質の乖離度を検証（過剰の場合）
    // 計算式: (62.5 - 60.0) / 60.0 × 100 = 4.17
    const fat_result = result.deviation_results.find((item: any) => item.nutrient_id === 'fat_001');
    expect(fat_result).toBeDefined();
    expect(fat_result.nutrient_name).toBe('脂質');
    expect(fat_result.actual_value).toBe(62.5);
    expect(fat_result.target_value).toBe(60.0);
    expect(Math.round(fat_result.deviation_percentage * 100) / 100).toBe(4.17);

    // 検証5: ビタミンAの乖離度を検証
    // 計算式: (720.0 - 800.0) / 800.0 × 100 = -10.0
    const vitaminA_result = result.deviation_results.find((item: any) => item.nutrient_id === 'vitaminA_001');
    expect(vitaminA_result).toBeDefined();
    expect(vitaminA_result.nutrient_name).toBe('ビタミンA');
    expect(vitaminA_result.actual_value).toBe(720.0);
    expect(vitaminA_result.target_value).toBe(800.0);
    expect(vitaminA_result.deviation_percentage).toBe(-10.0);
    expect(vitaminA_result.unit).toBe('μg');

    // 検証6: カルシウムの乖離度を検証
    // 計算式: (920.0 - 1000.0) / 1000.0 × 100 = -8.0
    const calcium_result = result.deviation_results.find((item: any) => item.nutrient_id === 'calcium_001');
    expect(calcium_result).toBeDefined();
    expect(calcium_result.nutrient_name).toBe('カルシウム');
    expect(calcium_result.actual_value).toBe(920.0);
    expect(calcium_result.target_value).toBe(1000.0);
    expect(calcium_result.deviation_percentage).toBe(-8.0);
    expect(calcium_result.unit).toBe('mg');

    // 検証7: すべての栄養項目が独立して計算されていることを確認
    const nutrient_ids = result.deviation_results.map((item: any) => item.nutrient_id);
    expect(new Set(nutrient_ids).size).toBe(5); // 重複なし
    expect(nutrient_ids).toEqual(
      expect.arrayContaining(['protein_001', 'carbs_001', 'fat_001', 'vitaminA_001', 'calcium_001'])
    );

    // 検証8: 小数点精度が適切に保たれていることを確認
    result.deviation_results.forEach((item: any) => {
      // 小数点以下2位までの精度を確認
      const decimal_places = (item.deviation_percentage.toString().split('.')[1] || '').length;
      expect(decimal_places).toBeLessThanOrEqual(2);
    });

    // 検証9: 可視化用のメタデータが含まれていることを確認
    expect(result.visualization_data).toBeDefined();
    expect(result.visualization_data.chart_type).toBe('bar_chart');
    expect(result.visualization_data.x_axis_label).toBe('栄養項目');
    expect(result.visualization_data.y_axis_label).toBe('乖離度 (%)');

    // 検証10: 複数の栄養項目について独立した計算結果が得られたことを総合確認
    expect(result.summary).toBeDefined();
    expect(result.summary.total_items_analyzed).toBe(5);
    expect(result.summary.items_below_target).toBe(4); // タンパク質、炭水化物、ビタミンA、カルシウム
    expect(result.summary.items_above_target).toBe(1); // 脂質
  });
});