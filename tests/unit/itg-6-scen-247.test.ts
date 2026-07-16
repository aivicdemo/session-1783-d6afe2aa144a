import { classifyFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('献立生成失敗パターン分類・影響度分析', () => {
  // SCEN-247
  test('未定義のカテゴリ値を含む失敗パターンデータをハンドリングし、予期しないカテゴリとして記録される', () => {
    const failurePatternData = [
      {
        pattern_id: 'fp_001',
        failure_reason: '栄養バランス不適切',
        category: '栄養バランス',
        occurrence_count: 12,
        impact_score: 85,
        rejection_frequency: 0.15,
      },
      {
        pattern_id: 'fp_002',
        failure_reason: '理由不明',
        category: null,
        occurrence_count: 5,
        impact_score: 45,
        rejection_frequency: 0.08,
      },
      {
        pattern_id: 'fp_003',
        failure_reason: '予期しない状態',
        category: undefined,
        occurrence_count: 3,
        impact_score: 30,
        rejection_frequency: 0.05,
      },
      {
        pattern_id: 'fp_004',
        failure_reason: '調理時間超過',
        category: '調理時間超過',
        occurrence_count: 8,
        impact_score: 72,
        rejection_frequency: 0.10,
      },
    ];

    const result = classifyFailurePatterns(failurePatternData);

    expect(result).toBeDefined();
    expect(result.classified_patterns).toBeDefined();
    expect(Array.isArray(result.classified_patterns)).toBe(true);

    expect(result.classified_patterns.length).toBe(4);

    const unclassifiedPatterns = result.classified_patterns.filter(
      (p: any) => p.normalized_category === '予期しないカテゴリ'
    );
    expect(unclassifiedPatterns.length).toBe(2);

    const fp_002_result = result.classified_patterns.find(
      (p: any) => p.pattern_id === 'fp_002'
    );
    expect(fp_002_result).toBeDefined();
    expect(fp_002_result.normalized_category).toBe('予期しないカテゴリ');
    expect(fp_002_result.original_category).toBe(null);
    expect(fp_002_result.occurrence_count).toBe(5);
    expect(fp_002_result.impact_score).toBe(45);
    expect(fp_002_result.error_handling_applied).toBe(true);

    const fp_003_result = result.classified_patterns.find(
      (p: any) => p.pattern_id === 'fp_003'
    );
    expect(fp_003_result).toBeDefined();
    expect(fp_003_result.normalized_category).toBe('予期しないカテゴリ');
    expect(fp_003_result.original_category).toBeUndefined();
    expect(fp_003_result.error_handling_applied).toBe(true);

    const nutritionPattern = result.classified_patterns.find(
      (p: any) => p.pattern_id === 'fp_001'
    );
    expect(nutritionPattern).toBeDefined();
    expect(nutritionPattern.normalized_category).toBe('栄養バランス');
    expect(nutritionPattern.error_handling_applied).toBe(false);

    expect(result.impact_analysis).toBeDefined();
    expect(result.impact_analysis.total_patterns_analyzed).toBe(4);
    expect(result.impact_analysis.patterns_with_undefined_category).toBe(2);
    expect(result.impact_analysis.defined_category_count).toBe(2);

    const unclassifiedImpactTotal = unclassifiedPatterns.reduce(
      (sum: number, p: any) => sum + p.impact_score,
      0
    );
    expect(result.impact_analysis.undefined_category_total_impact).toBe(
      unclassifiedImpactTotal
    );

    expect(result.impact_analysis.undefined_category_occurrence_total).toBe(8);

    expect(result.exception_thrown).toBe(false);
    expect(result.processing_completed).toBe(true);

    const priorityMatrix = result.impact_analysis.priority_matrix;
    expect(priorityMatrix).toBeDefined();
    const matrixUndefinedEntry = priorityMatrix.find(
      (entry: any) => entry.category === '予期しないカテゴリ'
    );
    expect(matrixUndefinedEntry).toBeDefined();
    expect(matrixUndefinedEntry.frequency_rank).toBeGreaterThanOrEqual(1);
    expect(matrixUndefinedEntry.impact_rank).toBeGreaterThanOrEqual(1);
    expect(matrixUndefinedEntry.priority_score).toBeGreaterThanOrEqual(0);

    expect(result.classification_summary.total_categories).toBe(4);
    expect(
      result.classification_summary.categories_with_errors
    ).toContain('予期しないカテゴリ');
  });
});