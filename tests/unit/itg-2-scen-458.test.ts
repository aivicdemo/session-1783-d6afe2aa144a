import { determineVerificationTiming } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - 検証タイミング判定機能', () => {
  // SCEN-458: [normal] 検証タイミング判定機能 - 検証周期到来時にシステムが検証タイミング到来を正しく判定する
  test('検証周期30日が経過した場合、検証タイミング到来フラグがtrueになり、次回検証予定日が正確に計算される', () => {
    const verification_cycle_days = 30;
    const last_verification_date = new Date('2024-11-15T00:00:00Z');
    const current_date = new Date('2024-12-15T00:00:00Z');

    const result = determineVerificationTiming({
      verification_cycle_days,
      last_verification_date,
      current_date,
    });

    expect(result.is_verification_timing_arrived).toBe(true);
    expect(result.next_verification_scheduled_date).toEqual(
      new Date('2025-01-14T00:00:00Z')
    );
    expect(result.alert_message).toMatch(/検証/);
  });
});