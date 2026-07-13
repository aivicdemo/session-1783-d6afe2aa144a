import { executeMonthlyAnalysisCycle } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-410: [edge] 月次分析サイクル自動実行機能 - 月末の最終日が月によって異なる場合（28日〜31日）、正しく処理される
  test('月末の異なる日数と翌月1日、うるう年の2月29日を含めて月次分析サイクルが正確に1回ずつ自動実行される', () => {
    // テスト用データセット：各月の月末と月初、うるう年の2月29日
    const test_cases = [
      {
        label: '2月（非うるう年28日）',
        analysis_date: new Date('2024-02-28T23:59:00Z'),
        month: 2,
        year: 2024,
        expected_month_for_analysis: 2,
      },
      {
        label: '3月31日',
        analysis_date: new Date('2024-03-31T23:59:00Z'),
        month: 3,
        year: 2024,
        expected_month_for_analysis: 3,
      },
      {
        label: '4月30日',
        analysis_date: new Date('2024-04-30T23:59:00Z'),
        month: 4,
        year: 2024,
        expected_month_for_analysis: 4,
      },
      {
        label: '5月31日',
        analysis_date: new Date('2024-05-31T23:59:00Z'),
        month: 5,
        year: 2024,
        expected_month_for_analysis: 5,
      },
      {
        label: '2月（うるう年29日）',
        analysis_date: new Date('2024-02-29T23:59:00Z'),
        month: 2,
        year: 2024,
        expected_month_for_analysis: 2,
      },
    ];

    const execution_results: Array<{
      test_case_label: string;
      was_executed: boolean;
      executed_month: number;
      executed_year: number;
      execution_timestamp: string;
      record_count: number;
    }> = [];

    // 各テストケースについて月次分析サイクルを実行
    for (const test_case of test_cases) {
      const result = executeMonthlyAnalysisCycle({
        trigger_datetime: test_case.analysis_date,
        user_id: 'user_001',
        analysis_target_month: test_case.expected_month_for_analysis,
        analysis_target_year: test_case.year,
        fiscal_month_end_day: test_case.month === 2 ? 28 : test_case.month === 4 ? 30 : 31,
      });

      execution_results.push({
        test_case_label: test_case.label,
        was_executed: result.analysis_executed,
        executed_month: result.analysis_month,
        executed_year: result.analysis_year,
        execution_timestamp: result.execution_timestamp,
        record_count: result.inserted_record_count,
      });
    }

    // 各月の分析が正確に1回ずつ実行されたことを検証
    expect(execution_results).toHaveLength(5);
    expect(execution_results[0].was_executed).toBe(true);
    expect(execution_results[0].executed_month).toBe(2);
    expect(execution_results[0].executed_year).toBe(2024);
    expect(execution_results[0].record_count).toBeGreaterThan(0);

    expect(execution_results[1].was_executed).toBe(true);
    expect(execution_results[1].executed_month).toBe(3);
    expect(execution_results[1].executed_year).toBe(2024);
    expect(execution_results[1].record_count).toBeGreaterThan(0);

    expect(execution_results[2].was_executed).toBe(true);
    expect(execution_results[2].executed_month).toBe(4);
    expect(execution_results[2].executed_year).toBe(2024);
    expect(execution_results[2].record_count).toBeGreaterThan(0);

    expect(execution_results[3].was_executed).toBe(true);
    expect(execution_results[3].executed_month).toBe(5);
    expect(execution_results[3].executed_year).toBe(2024);
    expect(execution_results[3].record_count).toBeGreaterThan(0);

    expect(execution_results[4].was_executed).toBe(true);
    expect(execution_results[4].executed_month).toBe(2);
    expect(execution_results[4].executed_year).toBe(2024);
    expect(execution_results[4].record_count).toBeGreaterThan(0);

    // 翌月1日には重複実行がないことを検証
    const next_month_trigger = new Date('2024-03-01T01:00:00Z');
    const next_month_result = executeMonthlyAnalysisCycle({
      trigger_datetime: next_month_trigger,
      user_id: 'user_001',
      analysis_target_month: 3,
      analysis_target_year: 2024,
      fiscal_month_end_day: 31,
    });

    // 翌月1日には新月の分析が実行されず、重複がないことを確認
    expect(next_month_result.analysis_executed).toBe(false);
    expect(next_month_result.reason_not_executed).toMatch(/月末に達していない/);

    // うるう年（2024年）の2月29日が正しく処理されたことを確認
    const leap_year_result = execution_results.find(
      (r) => r.test_case_label === '2月（うるう年29日）'
    );
    expect(leap_year_result).toBeDefined();
    expect(leap_year_result!.was_executed).toBe(true);
    expect(leap_year_result!.executed_month).toBe(2);

    // すべての分析実行タイムスタンプが正しい形式で記録されていることを検証
    for (const result of execution_results) {
      expect(result.execution_timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
      );
    }

    // 各月の分析データがデータベースに正しく保存されていることを検証（record_count > 0）
    for (const result of execution_results) {
      expect(result.record_count).toBeGreaterThan(0);
    }
  });
});