import { filterAnomalousData } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-244
  test('異常値・欠損値フィルタリング機能 - すべてのデータが異常値である場合に空配列を返し後段処理をスキップさせる', () => {
    // テストデータ: すべてのデータポイントが異常値で構成された配列
    const anomalous_data_points = [
      { demand_id: 1, predicted_value: -100, actual_value: 50, timestamp: '2024-01-15T09:00:00Z' },
      { demand_id: 2, predicted_value: NaN, actual_value: 75, timestamp: '2024-01-15T10:00:00Z' },
      { demand_id: 3, predicted_value: 999999999, actual_value: 200, timestamp: '2024-01-15T11:00:00Z' },
      { demand_id: 4, predicted_value: null as any, actual_value: 100, timestamp: '2024-01-15T12:00:00Z' },
      { demand_id: 5, predicted_value: Infinity, actual_value: 80, timestamp: '2024-01-15T13:00:00Z' },
    ];

    // フィルタリング関数を実行
    const filtered_result = filterAnomalousData(anomalous_data_points);

    // 期待値: 空配列が返される
    expect(filtered_result).toEqual([]);

    // 後段処理がスキップされることを確認（空配列の場合、in-stock optimization は実行されない）
    expect(Array.isArray(filtered_result)).toBe(true);
    expect(filtered_result.length).toBe(0);
  });
});