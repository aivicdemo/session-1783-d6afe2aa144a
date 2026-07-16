import { analyzeDataReliability } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-346
  test('分析結果信頼度判定機能 - 収集データが十分で信頼度スコアが閾値以上のとき、補完不要と判定される', () => {
    // テストデータセットアップ: 十分な量の収集データ(サンプル数≥閾値)を準備する
    const minimum_sample_size = 30;
    const collected_data = {
      interview_records_count: 35,
      app_log_entries_count: 1200,
      behavioral_metric_points: 42,
    };

    // 信頼度スコア計算: 収集データに対して信頼度判定機能を実行する
    const reliability_result = analyzeDataReliability({
      interview_records_count: collected_data.interview_records_count,
      app_log_entries_count: collected_data.app_log_entries_count,
      behavioral_metric_points: collected_data.behavioral_metric_points,
      minimum_sample_threshold: minimum_sample_size,
      reliability_score_threshold: 75,
    });

    // 信頼度スコア確認: 計算された信頼度スコアが設定済み閾値以上であることを検証する
    // 信頼度スコア計算式:
    // interview_reliability = (35 / 30) * 100 = 116.67 → cap to 100
    // log_reliability = min(1200 / 100, 100) * 100 = 100
    // metric_reliability = (42 / 30) * 100 = 140 → cap to 100
    // overall_reliability = (100 + 100 + 100) / 3 = 100
    expect(reliability_result.reliability_score).toBe(100);

    // 補完判定実行: 信頼度スコアに基づいて補完要否判定を実行する
    // 期待結果: 信頼度スコア(100) >= 閾値(75) → requires_supplementary_data = false
    expect(reliability_result.requires_supplementary_data).toBe(false);

    // 判定結果確認: 返却される判定結果を検証する
    expect(reliability_result).toEqual({
      reliability_score: 100,
      requires_supplementary_data: false,
      status: 'sufficient',
      recommended_supplementary_data_types: [],
    });
  });
});