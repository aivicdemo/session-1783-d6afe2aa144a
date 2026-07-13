import { calculateNutritionAchievementDegree, visualizePriorityImprovementGap } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養項目別達成度計算と改善ギャップの優先度付け可視化', () => {
  // SCEN-346
  test('食事記録が1件未満の場合、栄養分析が実行されず、エラーが返却される', () => {
    const user_id = 'USR-001';
    const meal_records = [];
    const nutrition_targets = [
      {
        nutrient_id: 'NUT-001',
        nutrient_name: 'カロリー',
        target_value: 2000,
        unit: 'kcal'
      },
      {
        nutrient_id: 'NUT-002',
        nutrient_name: 'タンパク質',
        target_value: 60,
        unit: 'g'
      }
    ];

    expect(() =>
      calculateNutritionAchievementDegree({
        user_id,
        meal_records,
        nutrition_targets
      })
    ).toThrow(/食事記録が不足/);
  });

  test('食事記録が1件未満の場合、改善ギャップの優先度付けが実行されず、エラーが返却される', () => {
    const user_id = 'USR-002';
    const meal_records = [];
    const nutrition_targets = [
      {
        nutrient_id: 'NUT-001',
        nutrient_name: 'ビタミンC',
        target_value: 100,
        unit: 'mg'
      }
    ];
    const achievement_degree_data = {};

    expect(() =>
      visualizePriorityImprovementGap({
        user_id,
        meal_records,
        nutrition_targets,
        achievement_degree_data
      })
    ).toThrow(/食事記録が不足/);
  });

  test('食事記録が1件以上ある場合、栄養項目別達成度が正常に計算される', () => {
    const user_id = 'USR-003';
    const meal_records = [
      {
        meal_record_id: 'MR-001',
        user_id,
        meal_date: '2024-01-15',
        meal_type: '朝食',
        meal_items: [
          {
            food_id: 'FOOD-001',
            food_name: '玉子焼き',
            quantity: 100,
            unit: 'g'
          }
        ]
      }
    ];
    const nutrition_targets = [
      {
        nutrient_id: 'NUT-001',
        nutrient_name: 'カロリー',
        target_value: 2000,
        unit: 'kcal'
      }
    ];
    const meal_nutrients = [
      {
        meal_record_id: 'MR-001',
        nutrient_id: 'NUT-001',
        actual_value: 500,
        unit: 'kcal'
      }
    ];

    const result = calculateNutritionAchievementDegree({
      user_id,
      meal_records,
      nutrition_targets,
      meal_nutrients
    });

    expect(result).toEqual(
      expect.objectContaining({
        user_id: 'USR-003',
        analysis_date: expect.any(String),
        achievement_results: expect.arrayContaining([
          expect.objectContaining({
            nutrient_id: 'NUT-001',
            nutrient_name: 'カロリー',
            target_value: 2000,
            actual_value: 500,
            achievement_percentage: 25
          })
        ])
      })
    );
  });

  test('改善ギャップが正常に計算され、優先度付けされる', () => {
    const user_id = 'USR-004';
    const meal_records = [
      {
        meal_record_id: 'MR-002',
        user_id,
        meal_date: '2024-01-15',
        meal_type: '朝食',
        meal_items: []
      }
    ];
    const nutrition_targets = [
      {
        nutrient_id: 'NUT-001',
        nutrient_name: 'カロリー',
        target_value: 2000,
        unit: 'kcal'
      },
      {
        nutrient_id: 'NUT-002',
        nutrient_name: 'タンパク質',
        target_value: 60,
        unit: 'g'
      },
      {
        nutrient_id: 'NUT-003',
        nutrient_name: 'ビタミンC',
        target_value: 100,
        unit: 'mg'
      }
    ];
    const achievement_degree_data = {
      achievement_results: [
        {
          nutrient_id: 'NUT-001',
          nutrient_name: 'カロリー',
          target_value: 2000,
          actual_value: 1500,
          achievement_percentage: 75
        },
        {
          nutrient_id: 'NUT-002',
          nutrient_name: 'タンパク質',
          target_value: 60,
          actual_value: 30,
          achievement_percentage: 50
        },
        {
          nutrient_id: 'NUT-003',
          nutrient_name: 'ビタミンC',
          target_value: 100,
          actual_value: 20,
          achievement_percentage: 20
        }
      ]
    };

    const result = visualizePriorityImprovementGap({
      user_id,
      meal_records,
      nutrition_targets,
      achievement_degree_data
    });

    expect(result).toEqual(
      expect.objectContaining({
        user_id: 'USR-004',
        analysis_date: expect.any(String),
        improvement_gaps: expect.arrayContaining([
          expect.objectContaining({
            nutrient_id: 'NUT-003',
            nutrient_name: 'ビタミンC',
            gap_value: 80,
            priority_rank: 1
          }),
          expect.objectContaining({
            nutrient_id: 'NUT-002',
            nutrient_name: 'タンパク質',
            gap_value: 30,
            priority_rank: 2
          }),
          expect.objectContaining({
            nutrient_id: 'NUT-001',
            nutrient_name: 'カロリー',
            gap_value: 25,
            priority_rank: 3
          })
        ])
      })
    );
  });
});