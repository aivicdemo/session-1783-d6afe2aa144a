import { filterAnomalousNutritionData } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-544: [edge] 異常値・欠損値フィルタリング機能 - 正常値と異常値が混在する場合に正常値のみが抽出される
  test('正常値と異常値が混在するデータセットをフィルタリングすると異常値が除外され正常値のみが返される', () => {
    const mixed_nutrition_data = [
      {
        meal_id: 'meal_001',
        calorie_kcal: 2000,
        protein_g: 50,
        recorded_at: '2024-01-15T12:00:00Z',
      },
      {
        meal_id: 'meal_002',
        calorie_kcal: -500,
        protein_g: 45,
        recorded_at: '2024-01-15T13:00:00Z',
      },
      {
        meal_id: 'meal_003',
        calorie_kcal: 1800,
        protein_g: null,
        recorded_at: '2024-01-15T14:00:00Z',
      },
      {
        meal_id: 'meal_004',
        calorie_kcal: 2100,
        protein_g: 55,
        recorded_at: '2024-01-15T15:00:00Z',
      },
      {
        meal_id: 'meal_005',
        calorie_kcal: 1950,
        protein_g: undefined,
        recorded_at: '2024-01-15T16:00:00Z',
      },
      {
        meal_id: 'meal_006',
        calorie_kcal: 2050,
        protein_g: 48,
        recorded_at: '2024-01-15T17:00:00Z',
      },
      {
        meal_id: 'meal_007',
        calorie_kcal: 0,
        protein_g: 52,
        recorded_at: '2024-01-15T18:00:00Z',
      },
      {
        meal_id: 'meal_008',
        calorie_kcal: 1900,
        protein_g: '',
        recorded_at: '2024-01-15T19:00:00Z',
      },
    ];

    const filtered_result = filterAnomalousNutritionData(mixed_nutrition_data);

    expect(filtered_result).toEqual([
      {
        meal_id: 'meal_001',
        calorie_kcal: 2000,
        protein_g: 50,
        recorded_at: '2024-01-15T12:00:00Z',
      },
      {
        meal_id: 'meal_004',
        calorie_kcal: 2100,
        protein_g: 55,
        recorded_at: '2024-01-15T15:00:00Z',
      },
      {
        meal_id: 'meal_006',
        calorie_kcal: 2050,
        protein_g: 48,
        recorded_at: '2024-01-15T17:00:00Z',
      },
    ]);

    expect(filtered_result.length).toBe(3);
    expect(mixed_nutrition_data.length - filtered_result.length).toBe(5);

    filtered_result.forEach((record: any) => {
      expect(record.calorie_kcal).toBeGreaterThan(0);
      expect(record.protein_g).toBeDefined();
      expect(record.protein_g).not.toBeNull();
      expect(record.protein_g).not.toBe('');
      expect(typeof record.protein_g).toBe('number');
    });
  });
});