import { determineAnalysisTiming } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-746
  test('分析タイミング判定機能 - 毎月初日 09:00 に月次分析タイミングが正しく判定される', () => {
    const current_date_time = new Date('2024-02-01T09:00:00Z');
    const last_analysis_date_time = new Date('2024-01-01T09:00:00Z');
    const analysis_cycle_type = 'monthly';

    const result = determineAnalysisTiming({
      current_date_time,
      last_analysis_date_time,
      analysis_cycle_type,
    });

    expect(result.is_analysis_timing_reached).toBe(true);
    expect(result.analysis_type).toBe('monthly');
    expect(result.next_analysis_scheduled_date).toEqual(new Date('2024-03-01T09:00:00Z'));
    expect(result.previous_period_start_date).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result.previous_period_end_date).toEqual(new Date('2024-01-31T23:59:59Z'));
    expect(result.should_reset_previous_data).toBe(true);
    expect(result.analysis_trigger_log).toMatch(/月次分析/);
    expect(result.data_reset_status).toBe('completed');
    expect(result.dashboard_update_status).toBe('ready');
  });
});