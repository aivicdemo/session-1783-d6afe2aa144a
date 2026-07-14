import { validateStagedRolloutPeriod } from '../../src/logic/it-7-2-1';

describe('段階的ロールアウト制御機能 - 検証期間の設定が無効な場合のエラー処理', () => {
  // SCEN-662
  test('検証期間が無効な場合（開始日付が終了日付より後）にエラーを返す', () => {
    const invalid_start_date = new Date('2024-12-31T23:59:59Z');
    const invalid_end_date = new Date('2024-01-01T00:00:00Z');

    const request_payload = {
      verification_period_start_date: invalid_start_date,
      verification_period_end_date: invalid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 20,
    };

    expect(() => validateStagedRolloutPeriod(request_payload)).toThrow(/検証期間/);
  });

  test('検証期間が有効な場合（開始日付が終了日付より前）に成功レスポンスを返す', () => {
    const valid_start_date = new Date('2024-01-01T00:00:00Z');
    const valid_end_date = new Date('2024-12-31T23:59:59Z');

    const request_payload = {
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 20,
    };

    const result = validateStagedRolloutPeriod(request_payload);

    expect(result).toEqual({
      is_valid: true,
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 20,
      saved: true,
    });
  });

  test('検証期間の開始日付と終了日付が同一の場合にエラーを返す', () => {
    const same_date = new Date('2024-06-15T12:00:00Z');

    const request_payload = {
      verification_period_start_date: same_date,
      verification_period_end_date: same_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 20,
    };

    expect(() => validateStagedRolloutPeriod(request_payload)).toThrow(/検証期間/);
  });

  test('ロールアウト率が無効な値（100%を超える）場合にエラーを返す', () => {
    const valid_start_date = new Date('2024-01-01T00:00:00Z');
    const valid_end_date = new Date('2024-12-31T23:59:59Z');

    const request_payload = {
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 150,
    };

    expect(() => validateStagedRolloutPeriod(request_payload)).toThrow(/ロールアウト率/);
  });

  test('ロールアウト率が無効な値（0%未満）場合にエラーを返す', () => {
    const valid_start_date = new Date('2024-01-01T00:00:00Z');
    const valid_end_date = new Date('2024-12-31T23:59:59Z');

    const request_payload = {
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: -10,
    };

    expect(() => validateStagedRolloutPeriod(request_payload)).toThrow(/ロールアウト率/);
  });

  test('有効なロールアウト率（1～100の範囲内）で設定が保存される', () => {
    const valid_start_date = new Date('2024-02-01T00:00:00Z');
    const valid_end_date = new Date('2024-02-14T23:59:59Z');

    const request_payload = {
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 50,
    };

    const result = validateStagedRolloutPeriod(request_payload);

    expect(result.is_valid).toBe(true);
    expect(result.saved).toBe(true);
    expect(result.max_rollout_percentage).toBe(50);
  });

  test('アルゴリズムバージョンIDが空文字列の場合にエラーを返す', () => {
    const valid_start_date = new Date('2024-01-01T00:00:00Z');
    const valid_end_date = new Date('2024-12-31T23:59:59Z');

    const request_payload = {
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: 'HOMEMAKER',
      algorithm_version_id: '',
      max_rollout_percentage: 20,
    };

    expect(() => validateStagedRolloutPeriod(request_payload)).toThrow(/アルゴリズムバージョン/);
  });

  test('対象ユーザーセグメントが未定義の場合にエラーを返す', () => {
    const valid_start_date = new Date('2024-01-01T00:00:00Z');
    const valid_end_date = new Date('2024-12-31T23:59:59Z');

    const request_payload = {
      verification_period_start_date: valid_start_date,
      verification_period_end_date: valid_end_date,
      target_user_segment: '',
      algorithm_version_id: 'algo-v2-5',
      max_rollout_percentage: 20,
    };

    expect(() => validateStagedRolloutPeriod(request_payload)).toThrow(/ユーザーセグメント/);
  });
});