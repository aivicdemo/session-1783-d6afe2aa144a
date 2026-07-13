import { detectAccuracyDeclineAndExtractMainFactors } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-265
  test('精度低下が前月比10%未満の場合、主要因抽出処理をスキップする', () => {
    const previous_accuracy = 85.0;
    const current_accuracy = 93.5;
    const decline_percentage = previous_accuracy - current_accuracy;

    const result = detectAccuracyDeclineAndExtractMainFactors({
      previous_month_accuracy: previous_accuracy,
      current_month_accuracy: current_accuracy,
    });

    expect(decline_percentage).toBe(-8.5);
    expect(decline_percentage).toBeLessThan(10);

    expect(result.accuracy_declined).toBe(false);
    expect(result.main_factors_extracted).toBe(false);
    expect(result.main_factors).toEqual([]);
    expect(result.extraction_log_entry_created).toBe(false);
    expect(result.system_error_occurred).toBe(false);
  });
});