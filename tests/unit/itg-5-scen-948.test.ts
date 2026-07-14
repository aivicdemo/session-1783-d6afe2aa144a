import { detectAndRemoveOutliers } from '../../src/logic/it-7-2-1';

describe('行動指標データの外れ値検出・除外機能', () => {
  // SCEN-948
  test('IQR法を用いた外れ値検出と除外が正しく機能する', () => {
    // テストデータ: 行動指標データ（例：ユーザーの滞在時間（秒））
    const behavior_metrics = [
      { user_id: 'user_001', session_duration_sec: 120 },
      { user_id: 'user_002', session_duration_sec: 135 },
      { user_id: 'user_003', session_duration_sec: 140 },
      { user_id: 'user_004', session_duration_sec: 145 },
      { user_id: 'user_005', session_duration_sec: 150 },
      { user_id: 'user_006', session_duration_sec: 155 },
      { user_id: 'user_007', session_duration_sec: 160 },
      { user_id: 'user_008', session_duration_sec: 165 },
      { user_id: 'user_009', session_duration_sec: 170 },
      { user_id: 'user_010', session_duration_sec: 175 },
      { user_id: 'user_011', session_duration_sec: 500 }, // 外れ値（上限超過）
      { user_id: 'user_012', session_duration_sec: 10 },   // 外れ値（下限未満）
    ];

    // IQR法の計算
    // ソート済みデータ: [10, 120, 135, 140, 145, 150, 155, 160, 165, 170, 175, 500]
    // Q1（第1四分位数、25%地点）= 135
    // Q3（第3四分位数、75%地点）= 170
    // IQR = Q3 - Q1 = 170 - 135 = 35
    // 下限値 = Q1 - 1.5 × IQR = 135 - 1.5 × 35 = 135 - 52.5 = 82.5
    // 上限値 = Q3 + 1.5 × IQR = 170 + 1.5 × 35 = 170 + 52.5 = 222.5
    // 外れ値: 500 > 222.5（上限超過）、 10 < 82.5（下限未満）

    const result = detectAndRemoveOutliers(behavior_metrics, 'session_duration_sec');

    // 除外後のデータが正常値のみで構成されていることを確認
    expect(result.valid_metrics.length).toBe(10);
    expect(result.outlier_metrics.length).toBe(2);

    // 除外されたレコードが期待値と一致することを確認
    expect(result.outlier_metrics.map((m) => m.user_id)).toEqual(
      expect.arrayContaining(['user_011', 'user_012'])
    );

    // 除外後のデータが下限値から上限値の範囲内であることを確認
    result.valid_metrics.forEach((metric) => {
      expect(metric.session_duration_sec).toBeGreaterThanOrEqual(82.5);
      expect(metric.session_duration_sec).toBeLessThanOrEqual(222.5);
    });

    // 元のデータセットと除外後のデータセットのサイズを比較検証
    expect(result.valid_metrics.length + result.outlier_metrics.length).toBe(
      behavior_metrics.length
    );

    // IQR法パラメータが正しく計算されていることを確認
    expect(result.iqr_params).toEqual({
      q1: 135,
      q3: 170,
      iqr: 35,
      lower_bound: 82.5,
      upper_bound: 222.5,
    });

    // 外れ値メトリクスが外れ値判定基準を満たすことを確認
    result.outlier_metrics.forEach((metric) => {
      const value = metric.session_duration_sec;
      const is_outlier =
        value < result.iqr_params.lower_bound ||
        value > result.iqr_params.upper_bound;
      expect(is_outlier).toBe(true);
    });
  });
});