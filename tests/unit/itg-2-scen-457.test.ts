import { calculateNextVerificationDate } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-457
  test('検証タイミング判定機能 - 前回検証日から月次検証周期で次回検証予定日が正しく計算される', () => {
    // ========== ハッピーパス: 通常月の月初日 ==========
    const lastVerificationDate_1 = new Date('2024-01-15T00:00:00Z');
    const cycle_1 = 'monthly';
    const result_1 = calculateNextVerificationDate(lastVerificationDate_1, cycle_1);
    expect(result_1).toEqual(new Date('2024-02-15T00:00:00Z'));

    // ========== 月末日パターン: 1月31日 → 2月29日（2024年はうるう年） ==========
    const lastVerificationDate_2 = new Date('2024-01-31T00:00:00Z');
    const cycle_2 = 'monthly';
    const result_2 = calculateNextVerificationDate(lastVerificationDate_2, cycle_2);
    expect(result_2).toEqual(new Date('2024-02-29T00:00:00Z'));

    // ========== 月末日パターン: 2月29日（うるう年） → 3月29日 ==========
    const lastVerificationDate_3 = new Date('2024-02-29T00:00:00Z');
    const cycle_3 = 'monthly';
    const result_3 = calculateNextVerificationDate(lastVerificationDate_3, cycle_3);
    expect(result_3).toEqual(new Date('2024-03-29T00:00:00Z'));

    // ========== 月末日パターン: 3月31日 → 4月30日（4月は30日） ==========
    const lastVerificationDate_4 = new Date('2024-03-31T00:00:00Z');
    const cycle_4 = 'monthly';
    const result_4 = calculateNextVerificationDate(lastVerificationDate_4, cycle_4);
    expect(result_4).toEqual(new Date('2024-04-30T00:00:00Z'));

    // ========== 月初日パターン: 1月1日 → 2月1日 ==========
    const lastVerificationDate_5 = new Date('2024-01-01T00:00:00Z');
    const cycle_5 = 'monthly';
    const result_5 = calculateNextVerificationDate(lastVerificationDate_5, cycle_5);
    expect(result_5).toEqual(new Date('2024-02-01T00:00:00Z'));

    // ========== 非うるう年: 2023年2月28日 → 3月28日 ==========
    const lastVerificationDate_6 = new Date('2023-02-28T00:00:00Z');
    const cycle_6 = 'monthly';
    const result_6 = calculateNextVerificationDate(lastVerificationDate_6, cycle_6);
    expect(result_6).toEqual(new Date('2023-03-28T00:00:00Z'));

    // ========== 12月から翌年1月への境界 ==========
    const lastVerificationDate_7 = new Date('2023-12-15T00:00:00Z');
    const cycle_7 = 'monthly';
    const result_7 = calculateNextVerificationDate(lastVerificationDate_7, cycle_7);
    expect(result_7).toEqual(new Date('2024-01-15T00:00:00Z'));

    // ========== エラーケース: null の前回検証日 ==========
    expect(() => calculateNextVerificationDate(null as any, 'monthly')).toThrow(/検証日/);

    // ========== エラーケース: 無効な周期指定 ==========
    expect(() => calculateNextVerificationDate(new Date('2024-01-15T00:00:00Z'), 'invalid' as any)).toThrow(/周期/);

    // ========== エラーケース: undefined の周期 ==========
    expect(() => calculateNextVerificationDate(new Date('2024-01-15T00:00:00Z'), undefined as any)).toThrow(/周期/);
  });
});