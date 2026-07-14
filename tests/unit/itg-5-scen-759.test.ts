import {
  validatePurchasingTrendApproval,
  markPurchasingTrendAsHeld,
  getPurchasingTrendStatus,
} from '../../src/logic/it-7-2-1';

describe('Purchase Trend Approval and Reflection Status Management', () => {
  // SCEN-759: [normal] Purchase trend approval judgment - when approval result is NO, reflection is held
  test('should hold reflection status when approval judgment result is NO', async () => {
    // Setup: Test purchasing trend data
    const trend_id = 'trend_20240115_001';
    const seasonal_pattern = 'spring_vegetables';
    const discount_rate_threshold = 15;
    const sales_period_start = new Date('2024-03-01T00:00:00Z');
    const sales_period_end = new Date('2024-05-31T23:59:59Z');
    const approval_result = 'NO';
    const approval_timestamp = new Date('2024-01-15T11:30:00Z');
    const approval_reason = 'Requires additional data validation';

    // Step 1: Execute approval judgment
    const approval_check = validatePurchasingTrendApproval({
      trend_id: trend_id,
      seasonal_pattern: seasonal_pattern,
      discount_rate_threshold: discount_rate_threshold,
      sales_period_start: sales_period_start,
      sales_period_end: sales_period_end,
    });

    expect(approval_check).toEqual({
      is_approved: false,
      approval_result: 'NO',
      message: expect.stringMatching(/validation|data|additional/i),
    });

    // Step 2: Mark purchasing trend as held (reflection on hold)
    const held_status = markPurchasingTrendAsHeld({
      trend_id: trend_id,
      approval_result: approval_result,
      approval_reason: approval_reason,
      approval_timestamp: approval_timestamp,
    });

    expect(held_status).toEqual({
      trend_id: trend_id,
      reflection_status: 'HELD',
      is_reflected: false,
      held_timestamp: approval_timestamp,
      held_reason: approval_reason,
    });

    // Step 3: Verify purchasing trend status - confirm it is in HELD state
    const current_status = getPurchasingTrendStatus({
      trend_id: trend_id,
    });

    expect(current_status).toEqual({
      trend_id: trend_id,
      reflection_status: 'HELD',
      is_reflected: false,
      is_pending_approval: true,
      last_update_timestamp: expect.any(String),
      status_message: expect.stringMatching(/held|pending|保留/i),
    });

    // Step 4: Verify that reflected_to_algorithm flag is false (not applied to production)
    expect(current_status.is_reflected).toBe(false);

    // Step 5: Verify that data is retained in database with HELD status (not discarded)
    expect(held_status.reflection_status).toBe('HELD');
    expect(held_status.is_reflected).toBe(false);

    // Step 6: Verify dashboard message indicates "reflection on hold"
    const dashboard_display_text = `Trend ${trend_id}: ${current_status.status_message}`;
    expect(dashboard_display_text).toMatch(/held|pending/i);
  });
});