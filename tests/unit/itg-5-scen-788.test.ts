import { detectPredictionAccuracyDecline } from '../../src/logic/it-7-2-1';

describe('Prediction Accuracy Decline Detection and Root Cause Analysis', () => {
  // SCEN-788
  test('should detect accuracy decline when category divergence exceeds threshold and trigger root cause analysis', () => {
    // Setup test data with multiple categories
    const testDataset = {
      categories: [
        {
          category_id: 'cat_001',
          category_name: '野菜',
          predicted_value: 100,
          actual_value: 107, // 7% divergence - exceeds 5% threshold
          threshold_percent: 5,
        },
        {
          category_id: 'cat_002',
          category_name: '肉類',
          predicted_value: 80,
          actual_value: 82, // 2.5% divergence - within threshold
          threshold_percent: 5,
        },
        {
          category_id: 'cat_003',
          category_name: '乳製品',
          predicted_value: 50,
          actual_value: 54, // 8% divergence - exceeds 5% threshold
          threshold_percent: 5,
        },
        {
          category_id: 'cat_004',
          category_name: '穀類',
          predicted_value: 120,
          actual_value: 119, // 0.83% divergence - within threshold
          threshold_percent: 5,
        },
      ],
    };

    // Execute accuracy analysis with threshold configuration
    const result = detectPredictionAccuracyDecline(testDataset);

    // Verify accuracy decline detection
    expect(result.accuracy_decline_detected).toBe(true);

    // Verify root cause analysis was triggered
    expect(result.root_cause_analysis_triggered).toBe(true);

    // Verify exceeded categories count
    expect(result.exceeded_categories_count).toBe(2);

    // Verify detailed analysis results for exceeded categories
    expect(result.analysis_details).toBeDefined();
    expect(result.analysis_details.length).toBe(2);

    // Verify first exceeded category (野菜) details
    const vegetableAnalysis = result.analysis_details.find(
      (detail) => detail.category_id === 'cat_001'
    );
    expect(vegetableAnalysis).toBeDefined();
    expect(vegetableAnalysis.category_name).toBe('野菜');
    expect(vegetableAnalysis.divergence_percent).toBe(7);
    expect(vegetableAnalysis.threshold_percent).toBe(5);
    expect(vegetableAnalysis.excess_rate_percent).toBe(2); // 7 - 5 = 2
    expect(vegetableAnalysis.exceeds_threshold).toBe(true);
    expect(vegetableAnalysis.estimated_cause).toBeDefined();
    expect(typeof vegetableAnalysis.estimated_cause).toBe('string');

    // Verify second exceeded category (乳製品) details
    const dairyAnalysis = result.analysis_details.find(
      (detail) => detail.category_id === 'cat_003'
    );
    expect(dairyAnalysis).toBeDefined();
    expect(dairyAnalysis.category_name).toBe('乳製品');
    expect(dairyAnalysis.divergence_percent).toBe(8);
    expect(dairyAnalysis.threshold_percent).toBe(5);
    expect(dairyAnalysis.excess_rate_percent).toBe(3); // 8 - 5 = 3
    expect(dairyAnalysis.exceeds_threshold).toBe(true);
    expect(dairyAnalysis.estimated_cause).toBeDefined();
    expect(typeof dairyAnalysis.estimated_cause).toBe('string');

    // Verify within-threshold categories are not in exceeded list
    const exceedingCategoryIds = result.analysis_details.map((d) => d.category_id);
    expect(exceedingCategoryIds).toContain('cat_001');
    expect(exceedingCategoryIds).toContain('cat_003');
    expect(exceedingCategoryIds).not.toContain('cat_002');
    expect(exceedingCategoryIds).not.toContain('cat_004');

    // Verify detailed report generation
    expect(result.detailed_report).toBeDefined();
    expect(result.detailed_report.report_id).toBeDefined();
    expect(typeof result.detailed_report.report_id).toBe('string');
    expect(result.detailed_report.report_id.length).toBeGreaterThan(0);

    expect(result.detailed_report.generated_at).toBeDefined();
    expect(typeof result.detailed_report.generated_at).toBe('string');

    expect(result.detailed_report.total_categories_analyzed).toBe(4);
    expect(result.detailed_report.categories_exceeding_threshold).toBe(2);

    // Verify report summary contains all necessary information
    expect(result.detailed_report.summary).toBeDefined();
    expect(typeof result.detailed_report.summary).toBe('string');
    expect(result.detailed_report.summary.length).toBeGreaterThan(0);

    // Verify report contains category-level details
    expect(result.detailed_report.category_details).toBeDefined();
    expect(Array.isArray(result.detailed_report.category_details)).toBe(true);
    expect(result.detailed_report.category_details.length).toBe(4);

    // Verify all categories are included in report (both exceeded and within-threshold)
    const reportCategoryIds = result.detailed_report.category_details.map(
      (cd) => cd.category_id
    );
    expect(reportCategoryIds).toContain('cat_001');
    expect(reportCategoryIds).toContain('cat_002');
    expect(reportCategoryIds).toContain('cat_003');
    expect(reportCategoryIds).toContain('cat_004');

    // Verify report recommendations are provided
    expect(result.detailed_report.recommendations).toBeDefined();
    expect(Array.isArray(result.detailed_report.recommendations)).toBe(true);
    expect(result.detailed_report.recommendations.length).toBeGreaterThan(0);

    // Verify each recommendation has required fields
    result.detailed_report.recommendations.forEach((recommendation) => {
      expect(recommendation.category_id).toBeDefined();
      expect(recommendation.priority_rank).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(recommendation.priority_rank);
      expect(recommendation.action).toBeDefined();
      expect(typeof recommendation.action).toBe('string');
    });

    // Verify high-priority recommendations exist for exceeded categories
    const highPriorityRecs = result.detailed_report.recommendations.filter(
      (rec) => rec.priority_rank === 'high'
    );
    expect(highPriorityRecs.length).toBeGreaterThan(0);
    const highPriorityCategoryIds = highPriorityRecs.map((rec) => rec.category_id);
    expect(highPriorityCategoryIds).toContain('cat_001');
    expect(highPriorityCategoryIds).toContain('cat_003');
  });
});