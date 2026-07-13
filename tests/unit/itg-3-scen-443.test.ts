import { recordPurchaseAndAnalyzeMonthlySavingsEffect } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Recording and Monthly Food Expense Savings Effect Analysis", () => {
  // SCEN-443: [error] SLA超過時の遅延対応と暫定処理 - SLA超過時に暫定処理が失敗した場合、エラー通知が発行され、ステークホルダーが即座に認知できる
  test("should generate and deliver error notifications to multiple channels within 5 minutes when SLA is exceeded and interim processing fails", () => {
    const purchase_record_id = "PR-2024-001";
    const user_id = "USR-20240115";
    const purchase_date = "2024-01-15T10:30:00Z";
    const amount_yen = 5500;
    const food_item_id = "FI-CARROT-001";
    const quantity = 2.5;
    const unit_price_yen = 200;
    const supermarket_id = "SM-AEON-SHIBUYA";
    const monthly_budget_limit_yen = 80000;
    const sla_threshold_seconds = 30;
    const interim_processing_failure_trigger = true;
    const notification_delivery_deadline_minutes = 5;

    const result = recordPurchaseAndAnalyzeMonthlySavingsEffect({
      purchase_record_id,
      user_id,
      purchase_date,
      amount_yen,
      food_item_id,
      quantity,
      unit_price_yen,
      supermarket_id,
      monthly_budget_limit_yen,
      sla_threshold_seconds,
      interim_processing_failure_trigger,
    });

    // Verify error notification is generated
    expect(result.error_notification).toBeDefined();
    expect(result.error_notification?.notification_id).toMatch(/^ERR-NOTIF-/);
    expect(result.error_notification?.status).toBe("generated");

    // Verify notification contains error content, timestamp, and impact scope
    expect(result.error_notification?.error_content).toMatch(/SLA超過|暫定処理失敗/);
    expect(result.error_notification?.generated_at).toBeDefined();
    expect(result.error_notification?.generated_timestamp_iso)
      .toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.error_notification?.impact_scope).toBeDefined();
    expect(result.error_notification?.impact_scope?.user_ids).toContain(user_id);
    expect(result.error_notification?.impact_scope?.affected_business_process)
      .toBe("purchase_recording_and_monthly_savings_analysis");

    // Verify notification is delivered to multiple channels
    expect(result.notification_delivery_channels).toBeDefined();
    expect(result.notification_delivery_channels?.length).toBeGreaterThanOrEqual(3);
    expect(result.notification_delivery_channels).toContain("email");
    expect(result.notification_delivery_channels).toContain("dashboard");
    expect(result.notification_delivery_channels).toContain("slack");

    // Verify email channel delivery details
    expect(result.email_delivery).toBeDefined();
    expect(result.email_delivery?.status).toBe("sent");
    expect(result.email_delivery?.recipient_count).toBeGreaterThan(0);
    expect(result.email_delivery?.sent_at_iso)
      .toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // Verify dashboard alert generation
    expect(result.dashboard_alert).toBeDefined();
    expect(result.dashboard_alert?.alert_visible).toBe(true);
    expect(result.dashboard_alert?.alert_type).toBe("error");
    expect(result.dashboard_alert?.severity_level).toBe("critical");

    // Verify Slack notification delivery
    expect(result.slack_notification).toBeDefined();
    expect(result.slack_notification?.sent).toBe(true);
    expect(result.slack_notification?.channel).toBe("#alerts");
    expect(result.slack_notification?.timestamp_sent_iso)
      .toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // Verify SLA compliance for notification delivery
    const generated_timestamp = new Date(
      result.error_notification?.generated_timestamp_iso || ""
    ).getTime();
    const email_sent_timestamp = new Date(
      result.email_delivery?.sent_at_iso || ""
    ).getTime();
    const slack_sent_timestamp = new Date(
      result.slack_notification?.timestamp_sent_iso || ""
    ).getTime();

    const email_delivery_time_minutes =
      (email_sent_timestamp - generated_timestamp) / 1000 / 60;
    const slack_delivery_time_minutes =
      (slack_sent_timestamp - generated_timestamp) / 1000 / 60;

    expect(email_delivery_time_minutes).toBeLessThanOrEqual(notification_delivery_deadline_minutes);
    expect(slack_delivery_time_minutes).toBeLessThanOrEqual(notification_delivery_deadline_minutes);

    // Verify notification content is clear and actionable
    expect(result.error_notification?.actionable_message).toBeDefined();
    expect(result.error_notification?.actionable_message).toMatch(
      /SLA超過|暫定処理|確認してください|管理者に連絡/
    );
    expect(result.error_notification?.recommended_action).toBeDefined();
    expect(result.error_notification?.recommended_action?.length).toBeGreaterThan(0);

    // Verify stakeholder notification history is recorded
    expect(result.notification_history).toBeDefined();
    expect(result.notification_history?.length).toBeGreaterThan(0);
    expect(result.notification_history).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          channel: "email",
          status: "delivered",
        }),
        expect.objectContaining({
          channel: "dashboard",
          status: "active",
        }),
        expect.objectContaining({
          channel: "slack",
          status: "delivered",
        }),
      ])
    );

    // Verify all stakeholders are acknowledged
    expect(result.stakeholder_acknowledgment_status).toBeDefined();
    expect(result.stakeholder_acknowledgment_status?.total_stakeholders).toBeGreaterThan(0);
    expect(result.stakeholder_acknowledgment_status?.awaiting_acknowledgment).toBeLessThanOrEqual(
      result.stakeholder_acknowledgment_status?.total_stakeholders
    );

    // Verify error logging is recorded for audit trail
    expect(result.error_log_entry).toBeDefined();
    expect(result.error_log_entry?.error_id).toMatch(/^ERR-LOG-/);
    expect(result.error_log_entry?.user_id).toBe(user_id);
    expect(result.error_log_entry?.error_type).toBe("SLA_EXCEEDED_INTERIM_PROCESSING_FAILURE");
    expect(result.error_log_entry?.recorded_at_iso)
      .toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // Verify system state indicates alert is active in management console
    expect(result.admin_console_state).toBeDefined();
    expect(result.admin_console_state?.alert_status).toBe("active");
    expect(result.admin_console_state?.alert_visibility).toBe("visible");
  });
});