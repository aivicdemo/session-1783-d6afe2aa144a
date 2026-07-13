import { calculateDeviationRate } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-429: [edge] 需要予測精度検証ダッシュボード - 予測値と実績値が完全に一致する場合、乖離0%と計算される
  test('予測値と実績値が完全に一致する場合、乖離率は0.00%と計算される', () => {
    // テスト用の予測データセット（100個の食材、各1000円）
    const forecast_data = Array.from({ length: 100 }, (_, i) => ({
      item_id: i + 1,
      forecast_price: 1000,
      forecast_quantity: 1
    }));

    // 対応する実績値データセット（100個の食材、各1000円）
    const actual_data = Array.from({ length: 100 }, (_, i) => ({
      item_id: i + 1,
      actual_price: 1000,
      actual_quantity: 1
    }));

    // 予測値と実績値のデータセットをシステムにアップロードして計算を実行
    const deviation_rate = calculateDeviationRate({
      forecast_data,
      actual_data
    });

    // 計算結果の乖離率を確認（小数点第2位までの精度で検証）
    expect(deviation_rate).toBe(0.00);
  });
});