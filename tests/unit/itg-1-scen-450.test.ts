import { checkMealEvaluationDeadline } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('食事評価入力期限管理機能', () => {
  test('SCEN-450: 入力期限超過時に専業主夫への通知が正常に送信される', () => {
    // 入力期限を過去の日時に設定（24時間以上経過）
    const evaluation_deadline = new Date('2024-01-14T20:00:00Z');
    const current_system_time = new Date('2024-01-16T10:30:00Z');
    const househusband_user_id = 'user_001_househusband';
    const family_member_id = 'fam_001';
    const meal_name = '鶏肉の塩焼き';
    const evaluation_input_deadline_hours = 24;

    // 入力期限チェック処理を実行
    const notification_result = checkMealEvaluationDeadline({
      family_member_id: family_member_id,
      meal_name: meal_name,
      evaluation_deadline: evaluation_deadline,
      current_system_time: current_system_time,
      househusband_user_id: househusband_user_id,
      evaluation_input_deadline_hours: evaluation_input_deadline_hours,
    });

    // 通知が送信されたことを確認
    expect(notification_result.is_notification_sent).toBe(true);

    // 通知の送信先が正しいユーザーID であることを確認
    expect(notification_result.notification_recipient_user_id).toBe(
      househusband_user_id
    );

    // 通知メッセージに期限超過の旨が含まれていることを確認
    expect(notification_result.notification_message).toMatch(/期限超過/);

    // 通知メッセージに期限日時が含まれていることを確認
    expect(notification_result.notification_message).toMatch(
      /2024-01-14T20:00:00Z/
    );

    // 通知メッセージに再入力を促すメッセージが含まれていることを確認
    expect(notification_result.notification_message).toMatch(/再入力/);

    // 通知の送信時刻がシステム時刻と一致していることを確認
    expect(notification_result.notification_sent_timestamp).toEqual(
      current_system_time
    );

    // 通知が送信履歴に記録されていることを確認
    expect(notification_result.notification_history_recorded).toBe(true);

    // 食事評価が未入力扱いになっていることを確認
    expect(notification_result.evaluation_status).toBe('未入力');

    // 超過経過時間が24時間以上であることを確認
    const deadline_ms = evaluation_deadline.getTime();
    const current_ms = current_system_time.getTime();
    const elapsed_hours = (current_ms - deadline_ms) / (1000 * 60 * 60);
    expect(elapsed_hours).toBeGreaterThanOrEqual(
      evaluation_input_deadline_hours
    );
  });
});