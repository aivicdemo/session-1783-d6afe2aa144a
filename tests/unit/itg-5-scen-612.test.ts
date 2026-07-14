import { judgePrecisionImprovementViability } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善案の精度向上判定機能', () => {
  // SCEN-612
  test('改善案が成功率向上4.9%で閾値5%に1毫未満の場合、本番反映不可と判定される', () => {
    const current_success_rate = 100.0;
    const new_success_rate = 104.9;
    const improvement_rate = new_success_rate - current_success_rate;
    const threshold_percentage = 5.0;

    const result = judgePrecisionImprovementViability({
      current_success_rate,
      new_success_rate,
      threshold_percentage,
    });

    expect(improvement_rate).toBe(4.9);
    expect(improvement_rate).toBeLessThan(threshold_percentage);
    expect(result.viable_for_production).toBe(false);
    expect(result.reason).toMatch(/閾値/);
  });
});