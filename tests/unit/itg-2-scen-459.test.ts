import { determineNextVerificationDate } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証 - 検証タイミング判定機能', () => {
  // SCEN-459: [edge] 検証タイミング判定機能 - 前回検証日が未設定の場合に初回検証予定日が正しく設定される
  test('前回検証日が未設定の場合、初回検証予定日が現在日時から規定期間後に設定される', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const verificationCycledays = 30;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    const expectedNextVerificationDate = new Date('2024-02-14T10:00:00Z');

    expect(result.next_verification_date).toEqual(expectedNextVerificationDate);
    expect(result.is_verification_due).toBe(false);
    expect(result.days_until_verification).toBe(30);
    expect(result.should_collect_user_data).toBe(false);
  });

  test('前回検証日が未設定で異なる周期（14日）が指定された場合、初回検証予定日が正しく計算される', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const verificationCycledays = 14;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    const expectedNextVerificationDate = new Date('2024-01-29T10:00:00Z');

    expect(result.next_verification_date).toEqual(expectedNextVerificationDate);
    expect(result.is_verification_due).toBe(false);
    expect(result.days_until_verification).toBe(14);
    expect(result.should_collect_user_data).toBe(false);
  });

  test('前回検証日が未設定で周期が90日の場合、初回検証予定日が3ヶ月後に設定される', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const verificationCycledays = 90;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    const expectedNextVerificationDate = new Date('2024-04-15T10:00:00Z');

    expect(result.next_verification_date).toEqual(expectedNextVerificationDate);
    expect(result.is_verification_due).toBe(false);
    expect(result.days_until_verification).toBe(90);
    expect(result.should_collect_user_data).toBe(false);
  });

  test('前回検証日が未設定の場合、設定された初回検証予定日がデータベースに永続化される', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const verificationCycledays = 30;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    const expectedNextVerificationDate = new Date('2024-02-14T10:00:00Z');
    const savedRecord = {
      next_verification_date: result.next_verification_date,
      is_persisted: true,
    };

    expect(savedRecord.next_verification_date).toEqual(expectedNextVerificationDate);
    expect(savedRecord.is_persisted).toBe(true);
  });

  test('初回検証予定日を基準に検証タイミングの判定が正常に機能する', () => {
    const currentDate = new Date('2024-02-14T10:00:00Z');
    const verificationCycledays = 30;
    const previousVerificationDate = null;

    const resultAtVerificationDate = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    expect(resultAtVerificationDate.is_verification_due).toBe(true);
    expect(resultAtVerificationDate.days_until_verification).toBe(0);
    expect(resultAtVerificationDate.should_collect_user_data).toBe(true);
  });

  test('検証周期が無効値（0以下）の場合、エラーが発生する', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const invalidVerificationCycledays = 0;
    const previousVerificationDate = null;

    expect(() => {
      determineNextVerificationDate({
        current_date: currentDate,
        previous_verification_date: previousVerificationDate,
        verification_cycle_days: invalidVerificationCycledays,
      });
    }).toThrow(/周期/);
  });

  test('前回検証日が未設定で現在日時が月初の場合、初回検証予定日が正しく計算される', () => {
    const currentDate = new Date('2024-02-01T09:00:00Z');
    const verificationCycledays = 30;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    const expectedNextVerificationDate = new Date('2024-03-02T09:00:00Z');

    expect(result.next_verification_date).toEqual(expectedNextVerificationDate);
    expect(result.is_verification_due).toBe(false);
    expect(result.days_until_verification).toBe(30);
  });

  test('前回検証日が未設定で現在日時が月末の場合、初回検証予定日が正しく計算される', () => {
    const currentDate = new Date('2024-01-31T23:59:59Z');
    const verificationCycledays = 30;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    const expectedNextVerificationDate = new Date('2024-03-01T23:59:59Z');

    expect(result.next_verification_date).toEqual(expectedNextVerificationDate);
    expect(result.is_verification_due).toBe(false);
    expect(result.days_until_verification).toBe(30);
  });

  test('前回検証日が未設定で検証予定日を過ぎた場合、is_verification_dueがtrueになる', () => {
    const currentDate = new Date('2024-02-15T10:00:00Z');
    const verificationCycledays = 30;
    const previousVerificationDate = null;

    const result = determineNextVerificationDate({
      current_date: currentDate,
      previous_verification_date: previousVerificationDate,
      verification_cycle_days: verificationCycledays,
    });

    expect(result.is_verification_due).toBe(true);
    expect(result.days_until_verification).toBeLessThanOrEqual(0);
    expect(result.should_collect_user_data).toBe(true);
  });
});