import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-956
  test('失敗パターン集計機能 - 集計対象データが空の場合、空の集計結果を返す', () => {
    // Arrange
    const emptyRejectionData: Array<{
      reason_id: string;
      reason_text: string;
      category: string;
      timestamp: string;
      user_id: string;
    }> = [];

    // Act
    const result = aggregateFailurePatterns(emptyRejectionData);

    // Assert
    expect(result).toEqual({
      total_pattern_count: 0,
      patterns_by_category: {},
      category_frequency: {},
      statistical_summary: {
        mean_occurrences: 0,
        max_occurrences: 0,
        min_occurrences: 0,
        standard_deviation: 0,
      },
      priority_ranking: [],
      analysis_timestamp: expect.any(String),
    });

    expect(result.total_pattern_count).toBe(0);
    expect(Object.keys(result.patterns_by_category).length).toBe(0);
    expect(Object.keys(result.category_frequency).length).toBe(0);
    expect(result.statistical_summary.mean_occurrences).toBe(0);
    expect(result.statistical_summary.max_occurrences).toBe(0);
    expect(result.statistical_summary.min_occurrences).toBe(0);
    expect(result.statistical_summary.standard_deviation).toBe(0);
    expect(result.priority_ranking).toEqual([]);
  });
});