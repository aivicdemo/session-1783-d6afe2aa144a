import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案', () => {
  // SCEN-856: [edge] 週次定量指標集計機能 - 集計対象期間が0件の献立生成ログで成功率が0%と算出される
  test('集計対象期間内に献立生成ログが0件の場合、成功率は0%として正常に算出される', () => {
    const start_date = '2024-01-15';
    const end_date = '2024-01-21';
    const menu_generation_logs: Array<{
      id: number;
      user_id: string;
      generated_at: string;
      is_success: boolean;
      cooking_time_minutes: number;
      satisfaction_score: number;
    }> = [];

    const result = aggregateWeeklyMetrics({
      start_date,
      end_date,
      menu_generation_logs,
    });

    // 成功率が0%であることをアサート
    expect(result.success_rate).toBe(0);

    // 調理時間短縮度が0%であることをアサート（ログなしのため基準値との比較不可）
    expect(result.cooking_time_reduction_rate).toBe(0);

    // ユーザー満足度スコアが0であることをアサート（ログなしのため平均計算不可）
    expect(result.average_satisfaction_score).toBe(0);

    // 集計対象期間がログなし（0件）であることをアサート
    expect(result.total_logs_count).toBe(0);

    // 成功ログ件数が0であることをアサート
    expect(result.success_logs_count).toBe(0);

    // 失敗ログ件数が0であることをアサート
    expect(result.failure_logs_count).toBe(0);

    // 集計結果全体のデータ構造が正常なJSON形式であることをアサート
    expect(result).toEqual({
      period_start: '2024-01-15',
      period_end: '2024-01-21',
      total_logs_count: 0,
      success_logs_count: 0,
      failure_logs_count: 0,
      success_rate: 0,
      cooking_time_reduction_rate: 0,
      average_satisfaction_score: 0,
      period_label: 'week_2024-01-15_to_2024-01-21',
    });

    // 集計結果がnullやundefinedではなく、有効なオブジェクトであることをアサート
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    expect(typeof result).toBe('object');
  });
});