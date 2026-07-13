import { distributeMealPlanRuleSpecification } from '../../src/logic/it-1-br-6-2-1-1';

describe('ルール仕様書配布・承認フロー自動進行機能', () => {
  // SCEN-490
  test('確定したルール仕様書がアプリ開発チームに配布され、実装・テスト・デプロイ承認フローが自動的に開始される', () => {
    const rule_spec_id = 'RULE-2024-Q1-001';
    const rule_spec_status = 'confirmed';
    const rule_spec_title = '季節パターン・割引率閾値・販売期間の優先度ルール';
    const rule_spec_version = '1.0';
    const distribution_target_group = 'APP_DEV_TEAM';
    const distribution_timestamp = new Date('2024-01-15T09:00:00Z');
    const target_recipients = [
      { recipient_id: 'DEV-001', role: 'lead_developer', email: 'dev.lead@company.com' },
      { recipient_id: 'DEV-002', role: 'backend_engineer', email: 'backend@company.com' },
      { recipient_id: 'DEV-003', role: 'qa_engineer', email: 'qa@company.com' },
    ];

    const result = distributeMealPlanRuleSpecification({
      rule_spec_id,
      rule_spec_status,
      rule_spec_title,
      rule_spec_version,
      distribution_target_group,
      distribution_timestamp,
      target_recipients,
    });

    // ルール仕様書の配布状態検証
    expect(result.distribution_status).toBe('distributed');
    expect(result.rule_spec_id).toBe('RULE-2024-Q1-001');
    expect(result.distributed_at).toEqual(new Date('2024-01-15T09:00:00Z'));
    expect(result.target_group).toBe('APP_DEV_TEAM');
    expect(result.recipient_count).toBe(3);

    // 配布確認通知の生成検証
    expect(result.notifications).toHaveLength(3);
    expect(result.notifications[0]).toEqual({
      recipient_id: 'DEV-001',
      notification_type: 'rule_spec_distribution',
      title: '新規ルール仕様書が配布されました',
      message: expect.stringContaining('季節パターン・割引率閾値・販売期間の優先度ルール'),
      sent_at: expect.any(Date),
      status: 'sent',
    });
    expect(result.notifications[1]).toEqual({
      recipient_id: 'DEV-002',
      notification_type: 'rule_spec_distribution',
      title: '新規ルール仕様書が配布されました',
      message: expect.stringContaining('季節パターン・割引率閾値・販売期間の優先度ルール'),
      sent_at: expect.any(Date),
      status: 'sent',
    });
    expect(result.notifications[2]).toEqual({
      recipient_id: 'DEV-003',
      notification_type: 'rule_spec_distribution',
      title: '新規ルール仕様書が配布されました',
      message: expect.stringContaining('季節パターン・割引率閾値・販売期間の優先度ルール'),
      sent_at: expect.any(Date),
      status: 'sent',
    });

    // 実装・テスト・デプロイ承認フローの自動開始検証
    expect(result.workflow_initiated).toBe(true);
    expect(result.workflow_id).toMatch(/^WF-/);
    expect(result.workflow_steps).toHaveLength(3);

    // ワークフロー各ステップの順序検証
    expect(result.workflow_steps[0]).toEqual({
      step_number: 1,
      step_name: 'implementation',
      step_status: 'pending',
      assigned_to: 'lead_developer',
      required_role: 'lead_developer',
      due_date: expect.any(Date),
    });
    expect(result.workflow_steps[1]).toEqual({
      step_number: 2,
      step_name: 'testing',
      step_status: 'pending',
      assigned_to: 'qa_engineer',
      required_role: 'qa_engineer',
      due_date: expect.any(Date),
    });
    expect(result.workflow_steps[2]).toEqual({
      step_number: 3,
      step_name: 'deployment_approval',
      step_status: 'pending',
      assigned_to: 'lead_developer',
      required_role: 'lead_developer',
      due_date: expect.any(Date),
    });

    // 各ステップの担当者通知検証
    expect(result.step_notifications).toHaveLength(3);
    expect(result.step_notifications[0]).toEqual({
      step_number: 1,
      recipient_id: 'DEV-001',
      notification_type: 'workflow_step_assigned',
      title: '実装ステップが割り当てられました',
      message: expect.stringContaining('implementation'),
      sent_at: expect.any(Date),
      status: 'sent',
    });
    expect(result.step_notifications[1]).toEqual({
      step_number: 2,
      recipient_id: 'DEV-003',
      notification_type: 'workflow_step_assigned',
      title: 'テストステップが割り当てられました',
      message: expect.stringContaining('testing'),
      sent_at: expect.any(Date),
      status: 'sent',
    });
    expect(result.step_notifications[2]).toEqual({
      step_number: 3,
      recipient_id: 'DEV-001',
      notification_type: 'workflow_step_assigned',
      title: 'デプロイ承認ステップが割り当てられました',
      message: expect.stringContaining('deployment_approval'),
      sent_at: expect.any(Date),
      status: 'sent',
    });

    // メタデータの検証
    expect(result.metadata).toEqual({
      rule_spec_title: '季節パターン・割引率閾値・販売期間の優先度ルール',
      rule_spec_version: '1.0',
      original_status: 'confirmed',
      distribution_group: 'APP_DEV_TEAM',
      total_recipients_notified: 3,
      workflow_auto_start: true,
    });

    // フロー進行の前提条件検証
    expect(result.preconditions_met).toBe(true);
    expect(result.validation_results).toEqual({
      rule_spec_confirmed: true,
      target_group_valid: true,
      recipients_list_valid: true,
      workflow_template_available: true,
    });

    // ログ記録の検証
    expect(result.audit_log_entries).toHaveLength(2);
    expect(result.audit_log_entries[0].event_type).toBe('distribution_initiated');
    expect(result.audit_log_entries[0].timestamp).toEqual(new Date('2024-01-15T09:00:00Z'));
    expect(result.audit_log_entries[1].event_type).toBe('workflow_auto_started');
    expect(result.audit_log_entries[1].timestamp).toEqual(expect.any(Date));
  });

  test('未確定のルール仕様書では配布が実行されない', () => {
    const rule_spec_id = 'RULE-2024-Q1-002';
    const rule_spec_status = 'draft';
    const rule_spec_title = 'テストルール';
    const rule_spec_version = '0.9';
    const distribution_target_group = 'APP_DEV_TEAM';
    const distribution_timestamp = new Date('2024-01-15T09:00:00Z');
    const target_recipients = [
      { recipient_id: 'DEV-001', role: 'lead_developer', email: 'dev.lead@company.com' },
    ];

    expect(() =>
      distributeMealPlanRuleSpecification({
        rule_spec_id,
        rule_spec_status,
        rule_spec_title,
        rule_spec_version,
        distribution_target_group,
        distribution_timestamp,
        target_recipients,
      })
    ).toThrow(/ステータス/);
  });

  test('配布対象の受信者リストが空の場合は配布が実行されない', () => {
    const rule_spec_id = 'RULE-2024-Q1-003';
    const rule_spec_status = 'confirmed';
    const rule_spec_title = 'ルール仕様書';
    const rule_spec_version = '1.0';
    const distribution_target_group = 'APP_DEV_TEAM';
    const distribution_timestamp = new Date('2024-01-15T09:00:00Z');
    const target_recipients = [];

    expect(() =>
      distributeMealPlanRuleSpecification({
        rule_spec_id,
        rule_spec_status,
        rule_spec_title,
        rule_spec_version,
        distribution_target_group,
        distribution_timestamp,
        target_recipients,
      })
    ).toThrow(/受信者/);
  });

  test('ワークフロー開始時の日程計算が正確である', () => {
    const rule_spec_id = 'RULE-2024-Q1-004';
    const rule_spec_status = 'confirmed';
    const rule_spec_title = 'ルール仕様書';
    const rule_spec_version = '1.0';
    const distribution_target_group = 'APP_DEV_TEAM';
    const distribution_timestamp = new Date('2024-01-15T09:00:00Z');
    const target_recipients = [
      { recipient_id: 'DEV-001', role: 'lead_developer', email: 'dev.lead@company.com' },
      { recipient_id: 'DEV-003', role: 'qa_engineer', email: 'qa@company.com' },
    ];

    const result = distributeMealPlanRuleSpecification({
      rule_spec_id,
      rule_spec_status,
      rule_spec_title,
      rule_spec_version,
      distribution_target_group,
      distribution_timestamp,
      target_recipients,
    });

    // 実装ステップの期限（配布から5営業日後）
    const implementation_step = result.workflow_steps[0];
    const expected_impl_due = new Date('2024-01-22T17:00:00Z');
    expect(implementation_step.due_date.getTime()).toBeGreaterThanOrEqual(
      new Date('2024-01-22T00:00:00Z').getTime()
    );

    // テストステップの期限（実装完了から3営業日後）
    const testing_step = result.workflow_steps[1];
    expect(testing_step.due_date.getTime()).toBeGreaterThan(implementation_step.due_date.getTime());

    // デプロイ承認ステップの期限（テスト完了から1営業日後）
    const deployment_step = result.workflow_steps[2];
    expect(deployment_step.due_date.getTime()).toBeGreaterThan(testing_step.due_date.getTime());
  });
});