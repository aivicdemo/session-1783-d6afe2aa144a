import { analyzeExternalDataCorrelation } from '../../src/logic/it-1-br-2-1-1-1';

const fetchMock = require('jest-fetch-mock');

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-375
  test('外部データソースの連携が失敗した場合、相関分析がスキップされ、適切なエラーハンドリングが実行される', async () => {
    fetchMock.resetMocks();

    // 外部データソース連携失敗をシミュレート
    fetchMock.mockRejectOnce(new Error('External data source connection failed'));

    const external_data_source_id = 'ext_weather_001';
    const user_id = 'user_12345';
    const analysis_period_start = '2024-01-01';
    const analysis_period_end = '2024-01-31';

    // 相関分析実行時に外部データソース連携が失敗するケース
    const result = await analyzeExternalDataCorrelation({
      external_data_source_id,
      user_id,
      analysis_period_start,
      analysis_period_end,
    });

    // 相関分析がスキップされたことを確認
    expect(result.analysis_status).toBe('skipped');

    // エラーメッセージが適切に返却される
    expect(result.error_message).toMatch(/外部データソース/);
    expect(result.error_message).toMatch(/接続/);

    // 内部データのみを用いた代替処理が実行されたことを確認
    expect(result.fallback_analysis_executed).toBe(true);

    // 代替分析の結果が存在することを確認
    expect(result.fallback_result).toBeDefined();
    expect(result.fallback_result.analysis_type).toBe('internal_data_only');

    // 再試行オプションが提供されることを確認
    expect(result.retry_available).toBe(true);
    expect(result.retry_suggestion).toMatch(/再試行/);
  });
});