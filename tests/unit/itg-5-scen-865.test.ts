import { categorizeAndRankFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-865
  test('失敗パターン優先度付け機能 - 優先度計算に必要な改善影響度データが存在しない場合にエラーが返却される', () => {
    const failure_patterns_without_improvement_data = [
      {
        pattern_id: 'pat_001',
        category: 'nutrition_imbalance',
        occurrence_count: 45,
        improvement_impact_data: null,
        user_satisfaction_impact: 0.8,
        implementation_difficulty: 0.5,
      },
      {
        pattern_id: 'pat_002',
        category: 'family_preference_not_reflected',
        occurrence_count: 32,
        improvement_impact_data: null,
        user_satisfaction_impact: 0.7,
        implementation_difficulty: 0.4,
      },
      {
        pattern_id: 'pat_003',
        category: 'cooking_time_exceeded',
        occurrence_count: 28,
        improvement_impact_data: null,
        user_satisfaction_impact: 0.6,
        implementation_difficulty: 0.3,
      },
    ];

    expect(() =>
      categorizeAndRankFailurePatterns(
        failure_patterns_without_improvement_data,
      ),
    ).toThrow(/改善影響度データ/);
  });
});