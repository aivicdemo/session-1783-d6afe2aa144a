import { determineNextVerificationSchedule } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-510
  test('月次検証完了時に次回検証実行タイミングと検証頻度が自動決定される', () => {
    // precondition: 月次検証サイクルが開始され、栄養士が全ての検証項目を完了した状態
    const current_verification_cycle = 'monthly';
    const verification_completion_date = new Date('2024-02-29T18:30:00Z');
    const user_verification_frequency_preference = 'monthly';
    const system_min_interval_days = 30;
    const last_verification_date = new Date('2024-01-29T18:30:00Z');

    // trigger: 月次検証の完了ボタンをクリックされた時点
    const verification_completion_input = {
      cycle_type: current_verification_cycle,
      completion_timestamp: verification_completion_date,
      user_frequency_preference: user_verification_frequency_preference,
      system_min_interval_days: system_min_interval_days,
      previous_verification_date: last_verification_date,
    };

    // outcome: システムが検証履歴とユーザー設定に基づいて次回検証実行タイミングと検証頻度を自動決定
    const result = determineNextVerificationSchedule(verification_completion_input);

    // assertion: 次回検証実行タイミング（日時）が自動決定される
    // 月次検証の完了日 + 最小インターバル(30日) = 2024-03-30T18:30:00Z
    const expected_next_verification_datetime = new Date('2024-03-30T18:30:00Z');
    expect(result.next_verification_datetime).toEqual(expected_next_verification_datetime);

    // assertion: 検証頻度がシステム設定に基づいて自動決定される
    expect(result.next_verification_frequency).toBe('monthly');

    // assertion: スケジュール情報に検証タイプが含まれている
    expect(result.verification_type).toBe('nutritional_basis_validation');

    // assertion: スケジュール情報がデータベース保存用の構造化フォーマットを保持している
    expect(result.is_database_persistable).toBe(true);

    // assertion: 検証カレンダー反映用フラグが設定されている
    expect(result.should_reflect_to_calendar).toBe(true);

    // assertion: 検証スケジュール情報が開発チーム通知用フォーマットを保持している
    expect(result.notification_payload).toBeDefined();
    expect(result.notification_payload.schedule_id).toBeDefined();
    expect(typeof result.notification_payload.schedule_id).toBe('string');

    // assertion: 検証スケジュール情報が次々回の検証予定も推測されている
    expect(result.subsequent_verification_datetime).toBeDefined();
    const expected_subsequent_verification_datetime = new Date('2024-04-29T18:30:00Z');
    expect(result.subsequent_verification_datetime).toEqual(expected_subsequent_verification_datetime);

    // assertion: スケジュール決定の根拠（メタデータ）が記録されている
    expect(result.schedule_decision_rationale).toBeDefined();
    expect(result.schedule_decision_rationale.basis_factors).toContain('user_preference');
    expect(result.schedule_decision_rationale.basis_factors).toContain('system_minimum_interval');
  });
});