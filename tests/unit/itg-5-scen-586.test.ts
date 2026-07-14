import { calculateDeviation } from '../../src/logic/it-7-2-1';

describe('需要予測精度の乖離分析機能', () => {
  // SCEN-586
  test('実績データが欠落している場合、乖離度の計算がエラーになる', () => {
    const forecast_data = [
      { period_id: 1, forecast_value: 100 },
      { period_id: 2, forecast_value: 120 },
      { period_id: 3, forecast_value: 110 },
    ];

    const actual_data = [
      { period_id: 1, actual_value: 95 },
      // period_id: 2 のデータが欠落
      { period_id: 3, actual_value: 105 },
    ];

    expect(() => {
      calculateDeviation({
        forecast_data,
        actual_data,
      });
    }).toThrow(/実績データ/);
  });
});