import { distributeRuleSpecification, trackDistributionConfirmation } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-481: [edge] ルール仕様書の対象者配布と確認追跡 - 対象者が 1 名のみの場合でもルール仕様書が配布され確認追跡が開始される
  test('should distribute rule specification to single recipient and track confirmation status', () => {
    fetchMock.resetMocks();

    // Arrange: ルール仕様書と対象者（1名のみ）のセットアップ
    const rule_spec_id = 'RULE-2024-Q1-001';
    const rule_spec_version = '1.0';
    const created_date = new Date('2024-03-15T09:00:00Z');
    const rule_spec_name = '季節パターン・割引率閾値・販売期間優先度ルール';
    const rule_spec_content = 'Spring season pattern: Cherry tomato priority +30, Bamboo shoot priority +25, Discount rate threshold: 15%';

    const recipient_user_id = 'USER-APP-DEV-001';
    const recipient_email = 'developer@foodapp.local';
    const recipient_name = '田中太郎';
    const distribution_scheduled_date = new Date('2024-03-15T10:00:00Z');

    // Arrange: 配布メッセージと受信確認のシミュレーション
    const distribution_message_id = 'MSG-DIST-2024-03-15-001';
    const distribution_timestamp = new Date('2024-03-15T10:00:00Z');
    const distribution_status = 'SENT';

    fetchMock.mockResponseOnce(
      JSON.stringify({
        distribution_id: 'DIST-2024-Q1-001',
        rule_spec_id: rule_spec_id,
        rule_spec_version: rule_spec_version,
        rule_spec_name: rule_spec_name,
        recipients_count: 1,
        recipients: [
          {
            user_id: recipient_user_id,
            email: recipient_email,
            name: recipient_name,
            distribution_status: distribution_status,
            distribution_timestamp: distribution_timestamp.toISOString(),
            distribution_message_id: distribution_message_id,
          },
        ],
        distribution_initiated_timestamp: distribution_timestamp.toISOString(),
      }),
      { status: 200 }
    );

    // Act: ルール仕様書配布を実行（対象者1名）
    const distribute_result = distributeRuleSpecification({
      rule_spec_id: rule_spec_id,
      rule_spec_version: rule_spec_version,
      rule_spec_name: rule_spec_name,
      rule_spec_content: rule_spec_content,
      target_recipients: [
        {
          user_id: recipient_user_id,
          email: recipient_email,
          name: recipient_name,
        },
      ],
      scheduled_distribution_date: distribution_scheduled_date,
    });

    // Assert: 配布結果の検証
    expect(distribute_result).toBeDefined();
    expect(distribute_result.distribution_id).toBe('DIST-2024-Q1-001');
    expect(distribute_result.rule_spec_id).toBe(rule_spec_id);
    expect(distribute_result.recipients_count).toBe(1);
    expect(distribute_result.recipients).toHaveLength(1);
    expect(distribute_result.recipients[0].user_id).toBe(recipient_user_id);
    expect(distribute_result.recipients[0].email).toBe(recipient_email);
    expect(distribute_result.recipients[0].distribution_status).toBe('SENT');
    expect(new Date(distribute_result.distribution_initiated_timestamp)).toEqual(distribution_timestamp);

    // Arrange: 確認追跡のセットアップ
    const confirmation_timestamp = new Date('2024-03-15T10:15:00Z');
    const confirmation_action = 'READ';
    const confirmation_status_log_id = 'CONFIRM-LOG-2024-03-15-001';

    fetchMock.mockResponseOnce(
      JSON.stringify({
        confirmation_tracking_id: 'TRACK-2024-03-15-001',
        distribution_id: 'DIST-2024-Q1-001',
        recipient_user_id: recipient_user_id,
        recipient_email: recipient_email,
        recipient_name: recipient_name,
        confirmation_status: 'CONFIRMED',
        confirmation_action: confirmation_action,
        confirmation_timestamp: confirmation_timestamp.toISOString(),
        confirmation_status_log_id: confirmation_status_log_id,
        confirmation_tracking_started: true,
        tracking_status_message: 'Confirmation tracking initiated for 1 recipient',
      }),
      { status: 200 }
    );

    // Act: 確認追跡を開始
    const tracking_result = trackDistributionConfirmation({
      distribution_id: 'DIST-2024-Q1-001',
      recipient_user_id: recipient_user_id,
      recipient_email: recipient_email,
      recipient_name: recipient_name,
      confirmation_action: confirmation_action,
      confirmation_timestamp: confirmation_timestamp,
    });

    // Assert: 確認追跡結果の検証
    expect(tracking_result).toBeDefined();
    expect(tracking_result.confirmation_tracking_id).toBe('TRACK-2024-03-15-001');
    expect(tracking_result.distribution_id).toBe('DIST-2024-Q1-001');
    expect(tracking_result.recipient_user_id).toBe(recipient_user_id);
    expect(tracking_result.recipient_email).toBe(recipient_email);
    expect(tracking_result.recipient_name).toBe(recipient_name);
    expect(tracking_result.confirmation_status).toBe('CONFIRMED');
    expect(tracking_result.confirmation_action).toBe('READ');
    expect(new Date(tracking_result.confirmation_timestamp)).toEqual(confirmation_timestamp);
    expect(tracking_result.confirmation_status_log_id).toBe(confirmation_status_log_id);
    expect(tracking_result.confirmation_tracking_started).toBe(true);
    expect(tracking_result.tracking_status_message).toBe('Confirmation tracking initiated for 1 recipient');

    // Assert: API呼び出しの確認
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});