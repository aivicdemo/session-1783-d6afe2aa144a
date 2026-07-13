import { validateDivergenceAnalysisAndMakeImprovementJudgment } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-428: [error] 需要予測精度検証ダッシュボード - 乖離分析結果がない場合、改善判定がスキップされエラーが返却される
  test('乖離分析結果がない場合、改善判定がスキップされ適切なエラーが返却される', () => {
    const input_divergence_analysis_results = null;
    const input_forecast_accuracy_threshold = 0.85;
    const input_improvement_decision_context = {
      forecast_id: 'FC-2024-001',
      previous_accuracy: 0.90,
      current_accuracy: 0.75,
      accuracy_decline_percentage: 16.67,
      dashboard_access_timestamp: new Date('2024-02-05T10:30:00Z'),
    };

    const result = validateDivergenceAnalysisAndMakeImprovementJudgment(
      input_divergence_analysis_results,
      input_forecast_accuracy_threshold,
      input_improvement_decision_context
    );

    expect(result).toEqual({
      success: false,
      status_code: 400,
      error_message: '乖離分析結果が見つかりません',
      improvement_decision_skipped: true,
      decision_details: null,
    });
    expect(result.success).toBe(false);
    expect(result.status_code).toBeGreaterThanOrEqual(400);
    expect(result.status_code).toBeLessThan(600);
    expect(result.improvement_decision_skipped).toBe(true);
    expect(result.decision_details).toBeNull();
  });

  test('乖離分析結果が空配列の場合、改善判定がスキップされ適切なエラーが返却される', () => {
    const input_divergence_analysis_results = [];
    const input_forecast_accuracy_threshold = 0.85;
    const input_improvement_decision_context = {
      forecast_id: 'FC-2024-002',
      previous_accuracy: 0.88,
      current_accuracy: 0.72,
      accuracy_decline_percentage: 18.18,
      dashboard_access_timestamp: new Date('2024-02-05T11:00:00Z'),
    };

    const result = validateDivergenceAnalysisAndMakeImprovementJudgment(
      input_divergence_analysis_results,
      input_forecast_accuracy_threshold,
      input_improvement_decision_context
    );

    expect(result).toEqual({
      success: false,
      status_code: 400,
      error_message: '乖離分析結果が見つかりません',
      improvement_decision_skipped: true,
      decision_details: null,
    });
  });

  test('乖離分析結果は存在するが不完全（必須フィールド欠落）の場合、エラーが返却される', () => {
    const input_divergence_analysis_results = [
      {
        analysis_id: 'DV-2024-001',
        forecast_date: new Date('2024-02-01'),
        // divergence_percentage 欠落
        category: 'vegetables',
      },
    ];
    const input_forecast_accuracy_threshold = 0.85;
    const input_improvement_decision_context = {
      forecast_id: 'FC-2024-003',
      previous_accuracy: 0.89,
      current_accuracy: 0.78,
      accuracy_decline_percentage: 12.36,
      dashboard_access_timestamp: new Date('2024-02-05T12:00:00Z'),
    };

    const result = validateDivergenceAnalysisAndMakeImprovementJudgment(
      input_divergence_analysis_results,
      input_forecast_accuracy_threshold,
      input_improvement_decision_context
    );

    expect(result.success).toBe(false);
    expect(result.status_code).toBeGreaterThanOrEqual(400);
    expect(result.improvement_decision_skipped).toBe(true);
    expect(() => {
      if (!result.success) throw new Error(result.error_message);
    }).toThrow(/分析結果/);
  });

  test('乖離分析結果が存在し完全な場合、改善判定が実行される', () => {
    const input_divergence_analysis_results = [
      {
        analysis_id: 'DV-2024-001',
        forecast_date: new Date('2024-02-01'),
        divergence_percentage: 8.5,
        category: 'vegetables',
        store_id: 'S-001',
      },
      {
        analysis_id: 'DV-2024-002',
        forecast_date: new Date('2024-02-02'),
        divergence_percentage: 12.3,
        category: 'fruits',
        store_id: 'S-001',
      },
      {
        analysis_id: 'DV-2024-003',
        forecast_date: new Date('2024-02-03'),
        divergence_percentage: 5.7,
        category: 'dairy',
        store_id: 'S-002',
      },
    ];
    const input_forecast_accuracy_threshold = 0.85;
    const input_improvement_decision_context = {
      forecast_id: 'FC-2024-004',
      previous_accuracy: 0.90,
      current_accuracy: 0.82,
      accuracy_decline_percentage: 8.89,
      dashboard_access_timestamp: new Date('2024-02-05T13:00:00Z'),
    };

    const result = validateDivergenceAnalysisAndMakeImprovementJudgment(
      input_divergence_analysis_results,
      input_forecast_accuracy_threshold,
      input_improvement_decision_context
    );

    expect(result.success).toBe(true);
    expect(result.improvement_decision_skipped).toBe(false);
    expect(result.decision_details).not.toBeNull();
    expect(result.decision_details).toEqual({
      should_implement_improvement: true,
      improvement_priority: 'high',
      average_divergence_percentage: 8.83,
      max_divergence_percentage: 12.3,
      divergence_samples_count: 3,
      recommendation: expect.any(String),
    });
  });

  test('乖離分析結果の平均乖離度が閾値以下の場合、改善不要と判定される', () => {
    const input_divergence_analysis_results = [
      {
        analysis_id: 'DV-2024-004',
        forecast_date: new Date('2024-02-01'),
        divergence_percentage: 2.1,
        category: 'grains',
        store_id: 'S-001',
      },
      {
        analysis_id: 'DV-2024-005',
        forecast_date: new Date('2024-02-02'),
        divergence_percentage: 3.5,
        category: 'meat',
        store_id: 'S-001',
      },
    ];
    const input_forecast_accuracy_threshold = 0.85;
    const input_improvement_decision_context = {
      forecast_id: 'FC-2024-005',
      previous_accuracy: 0.88,
      current_accuracy: 0.86,
      accuracy_decline_percentage: 2.27,
      dashboard_access_timestamp: new Date('2024-02-05T14:00:00Z'),
    };

    const result = validateDivergenceAnalysisAndMakeImprovementJudgment(
      input_divergence_analysis_results,
      input_forecast_accuracy_threshold,
      input_improvement_decision_context
    );

    expect(result.success).toBe(true);
    expect(result.improvement_decision_skipped).toBe(false);
    expect(result.decision_details?.should_implement_improvement).toBe(false);
    expect(result.decision_details?.average_divergence_percentage).toBeCloseTo(2.8, 1);
  });
});