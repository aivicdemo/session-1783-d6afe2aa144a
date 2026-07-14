import { it, describe, beforeEach, afterEach } from '@jest/globals';
import { detectOverdueEvaluationAndNotify } from '../../src/logic/it-7-2-1';

describe('食事評価入力期限管理機能 - 期限超過家族成員への通知', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-637
  it('期限超過家族成員への専業主夫への通知が正常に送信される', async () => {
    const household_head_user_id = 'USR_HOUSEHUSBAND_001';
    const household_head_name = '専業主夫太郎';
    const household_head_email = 'househusband@example.com';

    const family_member_id = 'FAM_MEMBER_001';
    const family_member_name = '子ども太郎';

    const evaluation_deadline_hours = 24;
    const current_timestamp = new Date('2024-01-15T20:00:00Z');
    const meal_completion_timestamp = new Date('2024-01-14T19:00:00Z');
    const deadline_timestamp = new Date('2024-01-15T19:00:00Z');

    const evaluation_input_data = {
      household_head_user_id,
      household_head_name,
      household_head_email,
      family_member_id,
      family_member_name,
      meal_id: 'MEAL_20240114_001',
      meal_date: '2024-01-14',
      meal_completion_timestamp: meal_completion_timestamp.toISOString(),
      evaluation_deadline_hours,
      current_timestamp: current_timestamp.toISOString(),
      deadline_timestamp: deadline_timestamp.toISOString(),
      evaluation_status: 'unentered',
      notification_sent: false,
    };

    const expected_notification_message = `食事評価入力期限超過のお知らせ: ${family_member_name}様の${meal_completion_timestamp.toLocaleDateString('ja-JP')}の食事評価が期限を超過しました。`;

    const expected_notification_log_entry = {
      household_head_user_id,
      household_head_email,
      notification_type: 'evaluation_deadline_overdue',
      family_member_id,
      family_member_name,
      meal_id: 'MEAL_20240114_001',
      notification_timestamp: expect.any(String),
      notification_content: expect.stringContaining('期限超過'),
      notification_status: 'sent',
      deadline_at: deadline_timestamp.toISOString(),
    };

    const result = await detectOverdueEvaluationAndNotify(evaluation_input_data);

    expect(result.is_deadline_overdue).toBe(true);
    expect(result.hours_overdue).toBeGreaterThanOrEqual(1);
    expect(result.notification_sent).toBe(true);
    expect(result.notification_recipient_user_id).toBe(household_head_user_id);
    expect(result.notification_recipient_email).toBe(household_head_email);
    expect(result.affected_family_member_id).toBe(family_member_id);
    expect(result.affected_family_member_name).toBe(family_member_name);
    expect(result.notification_message).toContain('期限超過');
    expect(result.notification_message).toContain(family_member_name);
    expect(result.notification_log).toEqual(
      expect.objectContaining({
        household_head_user_id,
        household_head_email,
        notification_type: 'evaluation_deadline_overdue',
        family_member_id,
        family_member_name,
        notification_status: 'sent',
      })
    );
    expect(result.notification_log.notification_timestamp).toBeDefined();
    expect(result.notification_log.notification_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});