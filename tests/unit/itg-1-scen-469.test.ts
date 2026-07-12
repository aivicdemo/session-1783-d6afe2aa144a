import { detectConflictingMealsWithNewRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出', () => {
  // SCEN-469
  test('新規食事制限条件が過去献立と抵触する場合、抵触リスク一覧を正確に検出して返却する', () => {
    // 過去献立データ（複数件）
    const pastMeals = [
      {
        meal_id: 'meal_001',
        meal_name: '海老フライ定食',
        generated_at: '2024-01-10T18:00:00Z',
        ingredients: ['海老', '小麦粉', '塩', '油']
      },
      {
        meal_id: 'meal_002',
        meal_name: 'チキンカレー',
        generated_at: '2024-01-11T18:00:00Z',
        ingredients: ['鶏肉', 'じゃがいも', '玉ねぎ', 'カレー粉']
      },
      {
        meal_id: 'meal_003',
        meal_name: '海老と野菜の炒め',
        generated_at: '2024-01-12T18:00:00Z',
        ingredients: ['海老', 'ピーマン', 'ニンニク', '塩']
      },
      {
        meal_id: 'meal_004',
        meal_name: '豚しゃぶしゃぶ',
        generated_at: '2024-01-13T18:00:00Z',
        ingredients: ['豚肉', 'もやし', 'ねぎ', 'ポン酢']
      }
    ];

    // 新規食事制限条件：海老アレルギー
    const newRestriction = {
      restriction_type: 'allergen',
      allergen_name: '海老',
      severity: 'high'
    };

    // 関数実行
    const result = detectConflictingMealsWithNewRestriction(
      pastMeals,
      newRestriction
    );

    // 期待される抵触献立は meal_001 と meal_003
    expect(result.conflicting_meal_count).toBe(2);
    
    expect(result.conflicting_meals).toHaveLength(2);
    
    // 抵触献立1件目の検証
    expect(result.conflicting_meals[0]).toEqual({
      meal_id: 'meal_001',
      meal_name: '海老フライ定食',
      generated_at: '2024-01-10T18:00:00Z',
      conflict_reason: '食材「海老」が食事制限「海老アレルギー」に抵触します',
      conflicting_ingredients: ['海老'],
      action_options: ['delete', 'modify']
    });

    // 抵触献立2件目の検証
    expect(result.conflicting_meals[1]).toEqual({
      meal_id: 'meal_003',
      meal_name: '海老と野菜の炒め',
      generated_at: '2024-01-12T18:00:00Z',
      conflict_reason: '食材「海老」が食事制限「海老アレルギー」に抵触します',
      conflicting_ingredients: ['海老'],
      action_options: ['delete', 'modify']
    });

    // 全体ステータス検証
    expect(result.status).toBe('detected');
    expect(result.has_conflicts).toBe(true);
  });
});