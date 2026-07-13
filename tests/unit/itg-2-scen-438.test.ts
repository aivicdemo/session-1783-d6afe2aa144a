import { prioritizeNutritionDeficiencies } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データ自動集計・栄養ダッシュボード', () => {
  // SCEN-438: [edge] 栄養不足項目の優先度付け機能 - 栄養不足項目が存在しない場合、空配列が返却される
  test('SCEN-438: 栄養不足項目が存在しない場合、空配列が返却される', () => {
    // 前提: 栄養項目別の達成度が集計されている状態
    // 発生条件: 栄養不足項目が存在しない状態のデータセット（空のデータ、またはnull）が渡される
    // 期待結果: 栄養不足項目が存在しない場合、空配列（[]）が返却されること

    // ケース 1: null が渡される場合
    const result_null = prioritizeNutritionDeficiencies(null);
    expect(Array.isArray(result_null)).toBe(true);
    expect(result_null.length).toBe(0);
    expect(result_null).toEqual([]);

    // ケース 2: 空配列が渡される場合
    const result_empty = prioritizeNutritionDeficiencies([]);
    expect(Array.isArray(result_empty)).toBe(true);
    expect(result_empty.length).toBe(0);
    expect(result_empty).toEqual([]);

    // ケース 3: 栄養不足項目のない結果を表現するオブジェクトが渡される場合
    const deficiencies_none = {
      insufficientItems: null,
      totalCount: 0
    };
    const result_none = prioritizeNutritionDeficiencies(deficiencies_none);
    expect(Array.isArray(result_none)).toBe(true);
    expect(result_none.length).toBe(0);
    expect(result_none).toEqual([]);

    // ケース 4: 栄養不足項目が存在する場合の正常系
    // 事前条件: 達成度が目標値未満の栄養項目が複数存在する状態
    const deficiencies_exist = [
      {
        nutrientId: 'nutrient_001',
        nutrientName: 'タンパク質',
        targetValue: 60,
        actualValue: 35,
        achievementRate: 58,
        improvementGap: 25,
        priorityScore: 8.5
      },
      {
        nutrientId: 'nutrient_002',
        nutrientName: 'カルシウム',
        targetValue: 800,
        actualValue: 480,
        achievementRate: 60,
        improvementGap: 320,
        priorityScore: 7.2
      }
    ];
    const result_exist = prioritizeNutritionDeficiencies(deficiencies_exist);
    expect(Array.isArray(result_exist)).toBe(true);
    expect(result_exist.length).toBe(2);
    expect(result_exist[0].priorityScore).toBeGreaterThanOrEqual(result_exist[1].priorityScore);
    expect(result_exist[0].nutrientId).toBe('nutrient_001');
    expect(result_exist[1].nutrientId).toBe('nutrient_002');
  });
});