import { analyzeAccuracyDecline } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records and Monthly Food Expense Savings Effect Analysis', () => {
  // SCEN-458: [edge] 予測精度低下要因分析機能 - 予測精度が前月比ちょうど10%低下した場合（境界値）に精度低下と判定される
  test('should detect accuracy decline when accuracy drops exactly 10% month-over-month and generate decline analysis report', () => {
    const previous_month_accuracy = 100;
    const current_month_accuracy = 90;
    const accuracy_decline_threshold = 10;
    const analysis_period_start = new Date('2024-01-01T00:00:00Z');
    const analysis_period_end = new Date('2024-01-31T23:59:59Z');
    const external_factors = [
      {
        factor_type: 'weather',
        factor_name: 'temperature_variation',
        impact_score: 5.2,
      },
      {
        factor_type: 'event',
        factor_name: 'holiday_period',
        impact_score: 3.8,
      },
      {
        factor_type: 'competitor_strategy',
        factor_name: 'discount_campaign',
        impact_score: 2.1,
      },
    ];

    const result = analyzeAccuracyDecline({
      previous_month_accuracy,
      current_month_accuracy,
      accuracy_decline_threshold,
      analysis_period_start,
      analysis_period_end,
      external_factors,
    });

    // 精度低下判定: 前月比ちょうど10%低下（100% → 90%）= 精度低下あり
    expect(result.is_accuracy_decline_detected).toBe(true);

    // 計算された精度低下度合い
    const calculated_decline_percentage =
      ((previous_month_accuracy - current_month_accuracy) /
        previous_month_accuracy) *
      100;
    expect(calculated_decline_percentage).toBe(10);
    expect(result.decline_percentage).toBe(10);

    // 前月精度と当月精度が正確に記録されている
    expect(result.previous_month_accuracy).toBe(100);
    expect(result.current_month_accuracy).toBe(90);

    // 分析レポートが生成されている
    expect(result.analysis_report).toBeDefined();
    expect(typeof result.analysis_report).toBe('object');

    // 分析レポートの構造検証
    expect(result.analysis_report).toHaveProperty('report_id');
    expect(result.analysis_report).toHaveProperty('generated_at');
    expect(result.analysis_report).toHaveProperty('decline_factors');
    expect(result.analysis_report).toHaveProperty('priority_ranking');

    // 低下要因分析が複数存在
    expect(Array.isArray(result.analysis_report.decline_factors)).toBe(true);
    expect(result.analysis_report.decline_factors.length).toBeGreaterThan(0);

    // 低下要因が優先度付けされている
    expect(Array.isArray(result.analysis_report.priority_ranking)).toBe(true);
    expect(result.analysis_report.priority_ranking.length).toBeGreaterThan(0);

    // 優先度ランキングの最高優先度が存在
    expect(result.analysis_report.priority_ranking[0]).toHaveProperty(
      'factor_category'
    );
    expect(result.analysis_report.priority_ranking[0]).toHaveProperty(
      'priority_score'
    );

    // 外部要因との相関分析が実施されている
    expect(result.analysis_report).toHaveProperty('external_factor_correlation');
    expect(
      typeof result.analysis_report.external_factor_correlation
    ).toBe('object');

    // 相関分析に外部要因ごとの相関係数が含まれている
    const correlation_data = result.analysis_report.external_factor_correlation;
    expect(correlation_data).toHaveProperty('weather_correlation');
    expect(correlation_data).toHaveProperty('event_correlation');
    expect(correlation_data).toHaveProperty('competitor_strategy_correlation');

    // 各相関係数が数値として存在
    expect(typeof correlation_data.weather_correlation).toBe('number');
    expect(typeof correlation_data.event_correlation).toBe('number');
    expect(typeof correlation_data.competitor_strategy_correlation).toBe(
      'number'
    );

    // 分析レポートにタイムスタンプが記録されている
    expect(result.analysis_report.generated_at).toBeDefined();
    expect(typeof result.analysis_report.generated_at).toBe('string');

    // 分析期間が正確に記録されている
    expect(result.analysis_report).toHaveProperty('analysis_period_start');
    expect(result.analysis_report).toHaveProperty('analysis_period_end');
    expect(result.analysis_report.analysis_period_start).toBe(
      analysis_period_start.toISOString()
    );
    expect(result.analysis_report.analysis_period_end).toBe(
      analysis_period_end.toISOString()
    );

    // 改善提案が生成されている
    expect(result.analysis_report).toHaveProperty('improvement_recommendations');
    expect(
      Array.isArray(result.analysis_report.improvement_recommendations)
    ).toBe(true);
    expect(
      result.analysis_report.improvement_recommendations.length
    ).toBeGreaterThan(0);

    // 各改善提案が必要な構造を持つ
    result.analysis_report.improvement_recommendations.forEach(
      (recommendation: any) => {
        expect(recommendation).toHaveProperty('recommendation_id');
        expect(recommendation).toHaveProperty('description');
        expect(recommendation).toHaveProperty('implementation_difficulty');
        expect(recommendation).toHaveProperty('expected_accuracy_improvement');
      }
    );

    // 結果の一貫性確認: is_accuracy_decline_detected = true && decline_percentage >= threshold
    expect(result.is_accuracy_decline_detected).toBe(
      result.decline_percentage >= accuracy_decline_threshold
    );
  });
});