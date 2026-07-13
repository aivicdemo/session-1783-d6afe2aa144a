import { calculateMonthlyAnalysisCycle } from '../../src/logic/it-1-br-3-2-1';

describe('月次食費実績と栄養摂取状況の分析・家計方針調整 - 購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-408: [normal] 月末の指定日時に月次分析が自動実行され、7日以内に完了する
  test('SCEN-408: 月末23時に月次分析が自動実行され、7日以内に完了し、分析レポートが生成される', () => {
    // Arrange
    const trigger_timestamp = new Date('2024-01-31T23:00:00Z'); // 月末23時
    const analysis_start_time = new Date('2024-01-31T23:00:00Z');
    const analysis_end_time = new Date('2024-02-05T18:30:00Z'); // 5日18時間30分後
    const processing_duration_hours = 138.5; // 5日18時間30分
    const max_allowed_duration_hours = 168; // 7日以内（7日 = 168時間）

    const monthly_expense_summary = {
      total_expense: 45280,
      budget_limit: 50000,
      surplus_deficit: 4720, // 予算との差
    };

    const category_breakdown = [
      { category: '野菜', amount: 8500, percentage: 18.8 },
      { category: '肉類', amount: 12300, percentage: 27.2 },
      { category: '魚類', amount: 9800, percentage: 21.6 },
      { category: '調味料・其他', amount: 14680, percentage: 32.4 },
    ];

    const previous_month_expense = 48900;
    const comparison_amount = -3620; // 前月比で3620円削減
    const comparison_percentage = -7.4; // 前月比-7.4%

    const input = {
      scheduled_trigger_time: trigger_timestamp,
      user_id: 'user_001',
      analysis_period_start: new Date('2024-01-01T00:00:00Z'),
      analysis_period_end: new Date('2024-01-31T23:59:59Z'),
    };

    // Act
    const result = calculateMonthlyAnalysisCycle({
      scheduled_trigger_time: input.scheduled_trigger_time,
      user_id: input.user_id,
      analysis_period_start: input.analysis_period_start,
      analysis_period_end: input.analysis_period_end,
      analysis_actual_start_time: analysis_start_time,
      analysis_actual_end_time: analysis_end_time,
      expense_summary: monthly_expense_summary,
      category_breakdown: category_breakdown,
      previous_month_total: previous_month_expense,
    });

    // Assert - 分析が自動実行されたことを確認
    expect(result.is_triggered).toBe(true);
    expect(result.trigger_timestamp.getTime()).toBe(trigger_timestamp.getTime());

    // Assert - 処理時間が7日以内であることを検証
    const actual_duration_ms = analysis_end_time.getTime() - analysis_start_time.getTime();
    const actual_duration_hours = actual_duration_ms / (1000 * 60 * 60);
    expect(actual_duration_hours).toBeLessThanOrEqual(max_allowed_duration_hours);
    expect(actual_duration_hours).toBe(processing_duration_hours);

    // Assert - 分析レポートが生成されていることを確認
    expect(result.report).toBeDefined();
    expect(result.report).not.toBeNull();

    // Assert - 月間支出サマリーが含まれていることを確認
    expect(result.report.monthly_summary).toBeDefined();
    expect(result.report.monthly_summary.total_expense).toBe(monthly_expense_summary.total_expense);
    expect(result.report.monthly_summary.budget_limit).toBe(monthly_expense_summary.budget_limit);
    expect(result.report.monthly_summary.surplus_deficit).toBe(monthly_expense_summary.surplus_deficit);

    // Assert - カテゴリ別集計が含まれていることを確認
    expect(result.report.category_breakdown).toBeDefined();
    expect(result.report.category_breakdown).toHaveLength(4);
    expect(result.report.category_breakdown[0]).toEqual({
      category: '野菜',
      amount: 8500,
      percentage: 18.8,
    });
    expect(result.report.category_breakdown[1]).toEqual({
      category: '肉類',
      amount: 12300,
      percentage: 27.2,
    });
    expect(result.report.category_breakdown[2]).toEqual({
      category: '魚類',
      amount: 9800,
      percentage: 21.6,
    });
    expect(result.report.category_breakdown[3]).toEqual({
      category: '調味料・其他',
      amount: 14680,
      percentage: 32.4,
    });

    // Assert - 前月比較が含まれていることを確認
    expect(result.report.comparison_with_previous_month).toBeDefined();
    expect(result.report.comparison_with_previous_month.previous_month_total).toBe(previous_month_expense);
    expect(result.report.comparison_with_previous_month.current_month_total).toBe(monthly_expense_summary.total_expense);
    expect(result.report.comparison_with_previous_month.difference_amount).toBe(comparison_amount);
    expect(result.report.comparison_with_previous_month.difference_percentage).toBe(comparison_percentage);

    // Assert - 分析ステータスが完了で記録されていることを確認
    expect(result.analysis_status).toBe('completed');
    expect(result.completion_timestamp).toEqual(analysis_end_time);

    // Assert - 分析結果が正常に生成されたことを確認
    expect(result.is_analysis_successful).toBe(true);
    expect(result.has_expense_summary).toBe(true);
    expect(result.has_category_breakdown).toBe(true);
    expect(result.has_previous_comparison).toBe(true);
  });
});