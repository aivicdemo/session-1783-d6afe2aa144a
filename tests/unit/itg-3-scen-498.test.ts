import { validateRuleImplementationAndNotify } from '../../src/logic/it-1-br-6-2-1-1';

const fetchMock = require('jest-fetch-mock');

describe('Rule Implementation Validation and Notification', () => {
  test('SCEN-498: Problems detected in rule validation trigger developer team notification with detailed issue information', async () => {
    fetchMock.resetMocks();

    // Input: Rule change containing implementation issues
    const rule_change_input = {
      rule_id: 'RULE-2024-Q1-001',
      rule_name: 'Seasonal Pattern Priority Update',
      rule_type: 'seasonal_pattern',
      conflict_with_nutrition: true,
      conflict_reason: 'Spring vegetables introduce insufficient iron content',
      conflict_severity: 'high',
      affected_menu_count: 47,
      nutrition_standard_id: 'NS-2024-001',
      implementation_timestamp: '2024-01-15T10:30:00Z',
      dev_team_member_ids: ['DEV001', 'DEV002', 'DEV003'],
      notification_channel: 'email',
    };

    // Mock response: Validation detected multiple problems
    const validation_result = {
      validation_status: 'failed',
      validation_timestamp: '2024-01-15T10:35:22Z',
      problem_detected: true,
      issue_count: 3,
      issues: [
        {
          issue_id: 'ISSUE-001',
          issue_type: 'nutrition_conflict',
          severity: 'high',
          description: 'Rule conflicts with nutrition standards for iron intake',
          affected_recipes_count: 12,
          affected_family_members: ['FM001', 'FM002'],
          resolution_required: true,
        },
        {
          issue_id: 'ISSUE-002',
          issue_type: 'historical_incompatibility',
          severity: 'medium',
          description: 'Rule modification contradicts 8 historical menu preferences',
          affected_menus_count: 8,
          user_satisfaction_impact: -15.5,
          resolution_required: true,
        },
        {
          issue_id: 'ISSUE-003',
          issue_type: 'inventory_constraint_violation',
          severity: 'high',
          description: 'Recommended seasonal vegetables unavailable at partner vendors',
          unavailable_items_count: 5,
          alternative_available: false,
          resolution_required: true,
        },
      ],
      notification_payload: {
        recipient_role: 'development_team',
        recipient_count: 3,
        recipient_ids: ['DEV001', 'DEV002', 'DEV003'],
        notification_type: 'rule_validation_failure',
        notification_sent_timestamp: '2024-01-15T10:35:25Z',
        notification_channel: 'email',
        include_detailed_issues: true,
      },
      notification_log: [
        {
          notification_id: 'NOTIF-001',
          recipient_id: 'DEV001',
          recipient_email: 'dev1@example.com',
          notification_status: 'sent',
          sent_timestamp: '2024-01-15T10:35:26Z',
          issue_details_included: true,
          issue_count_in_notification: 3,
        },
        {
          notification_id: 'NOTIF-002',
          recipient_id: 'DEV002',
          recipient_email: 'dev2@example.com',
          notification_status: 'sent',
          sent_timestamp: '2024-01-15T10:35:27Z',
          issue_details_included: true,
          issue_count_in_notification: 3,
        },
        {
          notification_id: 'NOTIF-003',
          recipient_id: 'DEV003',
          recipient_email: 'dev3@example.com',
          notification_status: 'sent',
          sent_timestamp: '2024-01-15T10:35:28Z',
          issue_details_included: true,
          issue_count_in_notification: 3,
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(validation_result), {
      status: 200,
    });

    // Execute validation and notification
    const result = await validateRuleImplementationAndNotify(
      rule_change_input
    );

    // Assertions: Verify validation failure detection
    expect(result.validation_status).toBe('failed');
    expect(result.problem_detected).toBe(true);

    // Assertions: Verify issue detection count and details
    expect(result.issue_count).toBe(3);
    expect(result.issues).toHaveLength(3);
    expect(result.issues[0].issue_type).toBe('nutrition_conflict');
    expect(result.issues[0].severity).toBe('high');
    expect(result.issues[0].affected_recipes_count).toBe(12);
    expect(result.issues[0].resolution_required).toBe(true);

    expect(result.issues[1].issue_type).toBe('historical_incompatibility');
    expect(result.issues[1].severity).toBe('medium');
    expect(result.issues[1].affected_menus_count).toBe(8);
    expect(result.issues[1].user_satisfaction_impact).toBe(-15.5);

    expect(result.issues[2].issue_type).toBe('inventory_constraint_violation');
    expect(result.issues[2].severity).toBe('high');
    expect(result.issues[2].unavailable_items_count).toBe(5);
    expect(result.issues[2].alternative_available).toBe(false);

    // Assertions: Verify notification was triggered
    expect(result.notification_payload.recipient_role).toBe('development_team');
    expect(result.notification_payload.recipient_count).toBe(3);
    expect(result.notification_payload.notification_type).toBe(
      'rule_validation_failure'
    );
    expect(result.notification_payload.include_detailed_issues).toBe(true);

    // Assertions: Verify all notifications sent to dev team members
    expect(result.notification_log).toHaveLength(3);

    expect(result.notification_log[0].recipient_id).toBe('DEV001');
    expect(result.notification_log[0].notification_status).toBe('sent');
    expect(result.notification_log[0].issue_details_included).toBe(true);
    expect(result.notification_log[0].issue_count_in_notification).toBe(3);
    expect(result.notification_log[0].sent_timestamp).toBe(
      '2024-01-15T10:35:26Z'
    );

    expect(result.notification_log[1].recipient_id).toBe('DEV002');
    expect(result.notification_log[1].notification_status).toBe('sent');
    expect(result.notification_log[1].issue_count_in_notification).toBe(3);

    expect(result.notification_log[2].recipient_id).toBe('DEV003');
    expect(result.notification_log[2].notification_status).toBe('sent');
    expect(result.notification_log[2].issue_count_in_notification).toBe(3);

    // Assertions: Verify fetch was called with correct URL
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/rule-validation'),
      expect.any(Object)
    );

    // Assertions: Verify validation timestamp
    expect(result.validation_timestamp).toBe('2024-01-15T10:35:22Z');
  });
});