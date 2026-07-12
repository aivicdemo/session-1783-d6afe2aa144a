import { validateMenuFixation } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-352: [edge] 献立確定検証機能 - 予算上限を1円超過する献立は確定不可と判定される
  test('should reject menu fixation when total cost exceeds budget limit by 1 yen', () => {
    const budget_limit = 10000;
    const menu_total_cost = 10001;
    const menu_id = 'menu_20240115_001';
    const user_id = 'user_12345';
    const fixation_timestamp = new Date('2024-01-15T11:00:00Z');

    const input = {
      user_id,
      menu_id,
      budget_limit,
      menu_total_cost,
      fixation_timestamp,
    };

    const result = validateMenuFixation(input);

    expect(result.can_fixate).toBe(false);
    expect(result.validation_status).toBe('BUDGET_EXCEEDED');
    expect(result.exceeded_amount).toBe(1);
    expect(result.error_message).toMatch(/予算上限/);
    expect(result.is_fixated).toBe(false);
  });
});