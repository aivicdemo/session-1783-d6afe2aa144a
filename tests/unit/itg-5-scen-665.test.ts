import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateNutritionStandardVerificationTiming } from '../../src/logic/it-7-2-1';

describe('栄養基準ロジック検証タイミング確認機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-665
  test('検証周期が定義されていない場合にシステムが例外を返す', () => {
    const nutrition_standard_logic_id = 'NSL-001';
    const verification_cycle = null;
    const last_verification_date = '2024-01-15T11:00:00Z';
    const current_date = '2024-01-22T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    expect(() => validateNutritionStandardVerificationTiming(input)).toThrow(
      /検証周期/
    );
  });

  test('検証周期が月次で前回検証から30日以上経過した場合に次回検証実行予定日を返す', () => {
    const nutrition_standard_logic_id = 'NSL-001';
    const verification_cycle = 'monthly';
    const last_verification_date = '2024-01-15T11:00:00Z';
    const current_date = '2024-02-20T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    const result = validateNutritionStandardVerificationTiming(input);

    expect(result).toEqual({
      should_execute_verification: true,
      next_verification_scheduled_date: '2024-03-15T11:00:00Z',
      verification_target_period: {
        start_date: '2024-01-15T11:00:00Z',
        end_date: '2024-02-20T11:00:00Z',
      },
      days_since_last_verification: 36,
    });
  });

  test('検証周期が四半期で前回検証から90日未満の場合に検証実行待機を返す', () => {
    const nutrition_standard_logic_id = 'NSL-002';
    const verification_cycle = 'quarterly';
    const last_verification_date = '2024-01-15T11:00:00Z';
    const current_date = '2024-02-20T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    const result = validateNutritionStandardVerificationTiming(input);

    expect(result).toEqual({
      should_execute_verification: false,
      next_verification_scheduled_date: '2024-04-15T11:00:00Z',
      verification_target_period: null,
      days_since_last_verification: 36,
    });
  });

  test('検証周期が空文字列の場合にシステムが例外を返す', () => {
    const nutrition_standard_logic_id = 'NSL-003';
    const verification_cycle = '';
    const last_verification_date = '2024-01-15T11:00:00Z';
    const current_date = '2024-02-20T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    expect(() => validateNutritionStandardVerificationTiming(input)).toThrow(
      /検証周期/
    );
  });

  test('last_verification_dateが無効な日付フォーマットの場合にシステムが例外を返す', () => {
    const nutrition_standard_logic_id = 'NSL-004';
    const verification_cycle = 'monthly';
    const last_verification_date = 'invalid-date';
    const current_date = '2024-02-20T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    expect(() => validateNutritionStandardVerificationTiming(input)).toThrow(
      /検証対象期間/
    );
  });

  test('検証周期が月次で前回検証から30日以上経過した場合に詳細ログを記録', () => {
    const nutrition_standard_logic_id = 'NSL-005';
    const verification_cycle = 'monthly';
    const last_verification_date = '2024-01-15T11:00:00Z';
    const current_date = '2024-02-20T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    const result = validateNutritionStandardVerificationTiming(input);

    expect(result).toHaveProperty('should_execute_verification', true);
    expect(result).toHaveProperty('verification_target_period');
    expect(result.verification_target_period).toEqual({
      start_date: '2024-01-15T11:00:00Z',
      end_date: '2024-02-20T11:00:00Z',
    });
  });

  test('検証周期が無効な値の場合にシステムが例外を返す', () => {
    const nutrition_standard_logic_id = 'NSL-006';
    const verification_cycle = 'invalid_cycle';
    const last_verification_date = '2024-01-15T11:00:00Z';
    const current_date = '2024-02-20T11:00:00Z';

    const input = {
      nutrition_standard_logic_id,
      verification_cycle,
      last_verification_date,
      current_date,
    };

    expect(() => validateNutritionStandardVerificationTiming(input)).toThrow(
      /検証周期/
    );
  });
});