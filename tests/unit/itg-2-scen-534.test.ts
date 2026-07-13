import { describe, test, expect, beforeEach } from '@jest/globals';
import { compareNutritionAchievementByPeriod } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養項目別達成度比較機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-534
  test('改善後蓄積期間が1週間未満の場合、エラーで処理が中断される', () => {
    const preImprovementData = [
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 45,
        unit: 'g',
        achievement_rate: 90,
        recorded_date: '2024-01-01',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 48,
        unit: 'g',
        achievement_rate: 96,
        recorded_date: '2024-01-02',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 50,
        unit: 'g',
        achievement_rate: 100,
        recorded_date: '2024-01-03',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 47,
        unit: 'g',
        achievement_rate: 94,
        recorded_date: '2024-01-04',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 49,
        unit: 'g',
        achievement_rate: 98,
        recorded_date: '2024-01-05',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 46,
        unit: 'g',
        achievement_rate: 92,
        recorded_date: '2024-01-06',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 51,
        unit: 'g',
        achievement_rate: 102,
        recorded_date: '2024-01-07',
      },
    ];

    const postImprovementData = [
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 52,
        unit: 'g',
        achievement_rate: 104,
        recorded_date: '2024-01-08',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 50,
        unit: 'g',
        achievement_rate: 100,
        recorded_date: '2024-01-09',
      },
      {
        nutrient_id: 1,
        nutrient_name: 'タンパク質',
        target_value: 50,
        actual_value: 51,
        unit: 'g',
        achievement_rate: 102,
        recorded_date: '2024-01-10',
      },
    ];

    const comparisonParams = {
      user_id: 'user_001',
      pre_improvement_period_start: '2024-01-01',
      pre_improvement_period_end: '2024-01-07',
      post_improvement_period_start: '2024-01-08',
      post_improvement_period_end: '2024-01-10',
      pre_improvement_data: preImprovementData,
      post_improvement_data: postImprovementData,
    };

    expect(() => {
      compareNutritionAchievementByPeriod(comparisonParams);
    }).toThrow(/蓄積期間/);
  });
});