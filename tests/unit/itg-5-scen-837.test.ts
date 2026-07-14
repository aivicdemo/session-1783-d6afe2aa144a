import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { approveRuleSpecificationAndInitiateApprovalFlow } from '../../src/logic/it-7-2-1';

const fetchMock = require('jest-fetch-mock');

describe('Rule Specification Approval Flow Automation', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-837
  test('should automatically initiate implementation, test, and deployment approval flows after PM approves rule specification', async () => {
    const rule_specification_id = 'rule_spec_q4_2024_001';
    const pm_user_id = 'pm_user_001';
    const approval_timestamp = new Date('2024-01-15T10:30:00Z');
    const rule_spec_version = '2024-Q4-v1';
    const seasonal_pattern_rules = [
      {
        season: 'winter',
        ingredients: ['root_vegetables', 'citrus'],
        priority_score: 85,
      },
      {
        season: 'spring',
        ingredients: ['leafy_greens', 'bamboo_shoots'],
        priority_score: 78,
      },
    ];
    const discount_threshold_rules = [
      {
        discount_rate_min: 20,
        discount_rate_max: 50,
        priority_boost: 15,
      },
      {
        discount_rate_min: 51,
        discount_rate_max: 100,
        priority_boost: 30,
      },
    ];
    const sales_period_rules = [
      {
        event_type: 'weekend_sale',
        duration_days: 2,
        applicable_categories: ['dairy', 'produce'],
      },
      {
        event_type: 'seasonal_campaign',
        duration_days: 7,
        applicable_categories: ['all'],
      },
    ];

    const pm_approval_input = {
      rule_specification_id,
      pm_user_id,
      approval_timestamp,
      rule_spec_version,
      seasonal_pattern_rules,
      discount_threshold_rules,
      sales_period_rules,
      approval_status: 'APPROVED',
    };

    const expected_distribution_status = 'DISTRIBUTING';
    const expected_implementation_phase_status = 'IN_PROGRESS';
    const expected_test_phase_status = 'WAITING';
    const expected_deployment_phase_status = 'WAITING';

    fetchMock.mockResponseOnce(
      JSON.stringify({
        approval_flow_id: 'flow_001',
        rule_specification_id,
        pm_user_id,
        approval_timestamp: approval_timestamp.toISOString(),
        distribution_status: expected_distribution_status,
        phases: [
          {
            phase_name: 'IMPLEMENTATION',
            phase_status: expected_implementation_phase_status,
            initiated_at: new Date('2024-01-15T10:31:00Z').toISOString(),
            target_completion_date: new Date('2024-01-22T18:00:00Z').toISOString(),
          },
          {
            phase_name: 'TEST',
            phase_status: expected_test_phase_status,
            initiated_at: null,
            target_completion_date: new Date('2024-01-29T18:00:00Z').toISOString(),
          },
          {
            phase_name: 'DEPLOYMENT',
            phase_status: expected_deployment_phase_status,
            initiated_at: null,
            target_completion_date: new Date('2024-02-05T18:00:00Z').toISOString(),
          },
        ],
        distributed_to_dev_team_members: [
          {
            dev_team_member_id: 'dev_001',
            distributed_at: new Date('2024-01-15T10:31:30Z').toISOString(),
            acknowledged: true,
            acknowledged_at: new Date('2024-01-15T10:35:00Z').toISOString(),
          },
          {
            dev_team_member_id: 'dev_002',
            distributed_at: new Date('2024-01-15T10:31:30Z').toISOString(),
            acknowledged: false,
            acknowledged_at: null,
          },
        ],
        approval_log: [
          {
            event_type: 'APPROVAL_INITIATED',
            timestamp: approval_timestamp.toISOString(),
            actor_id: pm_user_id,
            message: 'PM approval initiated for rule specification',
          },
          {
            event_type: 'DISTRIBUTION_STARTED',
            timestamp: new Date('2024-01-15T10:31:00Z').toISOString(),
            actor_id: 'system',
            message: 'Automatic distribution to dev team started',
          },
          {
            event_type: 'IMPLEMENTATION_PHASE_INITIATED',
            timestamp: new Date('2024-01-15T10:31:00Z').toISOString(),
            actor_id: 'system',
            message: 'Implementation phase automatically initiated',
          },
          {
            event_type: 'TEST_PHASE_PREPARED',
            timestamp: new Date('2024-01-15T10:31:05Z').toISOString(),
            actor_id: 'system',
            message: 'Test phase prepared and waiting for implementation completion',
          },
          {
            event_type: 'DEPLOYMENT_PHASE_PREPARED',
            timestamp: new Date('2024-01-15T10:31:05Z').toISOString(),
            actor_id: 'system',
            message: 'Deployment phase prepared and waiting for test completion',
          },
        ],
      }),
      { status: 200 }
    );

    const result = await approveRuleSpecificationAndInitiateApprovalFlow(pm_approval_input);

    expect(result.approval_flow_id).toBe('flow_001');
    expect(result.rule_specification_id).toBe(rule_specification_id);
    expect(result.pm_user_id).toBe(pm_user_id);
    expect(result.distribution_status).toBe(expected_distribution_status);

    expect(result.phases).toHaveLength(3);

    const implementation_phase = result.phases.find(
      (p: any) => p.phase_name === 'IMPLEMENTATION'
    );
    expect(implementation_phase.phase_status).toBe(expected_implementation_phase_status);
    expect(implementation_phase.initiated_at).toBe(
      new Date('2024-01-15T10:31:00Z').toISOString()
    );
    expect(implementation_phase.target_completion_date).toBe(
      new Date('2024-01-22T18:00:00Z').toISOString()
    );

    const test_phase = result.phases.find((p: any) => p.phase_name === 'TEST');
    expect(test_phase.phase_status).toBe(expected_test_phase_status);
    expect(test_phase.initiated_at).toBeNull();
    expect(test_phase.target_completion_date).toBe(
      new Date('2024-01-29T18:00:00Z').toISOString()
    );

    const deployment_phase = result.phases.find(
      (p: any) => p.phase_name === 'DEPLOYMENT'
    );
    expect(deployment_phase.phase_status).toBe(expected_deployment_phase_status);
    expect(deployment_phase.initiated_at).toBeNull();
    expect(deployment_phase.target_completion_date).toBe(
      new Date('2024-02-05T18:00:00Z').toISOString()
    );

    expect(result.distributed_to_dev_team_members).toHaveLength(2);
    expect(result.distributed_to_dev_team_members[0].dev_team_member_id).toBe(
      'dev_001'
    );
    expect(result.distributed_to_dev_team_members[0].acknowledged).toBe(true);
    expect(result.distributed_to_dev_team_members[0].acknowledged_at).toBe(
      new Date('2024-01-15T10:35:00Z').toISOString()
    );
    expect(result.distributed_to_dev_team_members[1].dev_team_member_id).toBe(
      'dev_002'
    );
    expect(result.distributed_to_dev_team_members[1].acknowledged).toBe(false);
    expect(result.distributed_to_dev_team_members[1].acknowledged_at).toBeNull();

    expect(result.approval_log).toHaveLength(5);

    const approval_initiated_log = result.approval_log.find(
      (l: any) => l.event_type === 'APPROVAL_INITIATED'
    );
    expect(approval_initiated_log.timestamp).toBe(approval_timestamp.toISOString());
    expect(approval_initiated_log.actor_id).toBe(pm_user_id);

    const distribution_started_log = result.approval_log.find(
      (l: any) => l.event_type === 'DISTRIBUTION_STARTED'
    );
    expect(distribution_started_log.timestamp).toBe(
      new Date('2024-01-15T10:31:00Z').toISOString()
    );
    expect(distribution_started_log.actor_id).toBe('system');

    const impl_phase_log = result.approval_log.find(
      (l: any) => l.event_type === 'IMPLEMENTATION_PHASE_INITIATED'
    );
    expect(impl_phase_log.timestamp).toBe(
      new Date('2024-01-15T10:31:00Z').toISOString()
    );

    const test_phase_log = result.approval_log.find(
      (l: any) => l.event_type === 'TEST_PHASE_PREPARED'
    );
    expect(test_phase_log.timestamp).toBe(
      new Date('2024-01-15T10:31:05Z').toISOString()
    );

    const deploy_phase_log = result.approval_log.find(
      (l: any) => l.event_type === 'DEPLOYMENT_PHASE_PREPARED'
    );
    expect(deploy_phase_log.timestamp).toBe(
      new Date('2024-01-15T10:31:05Z').toISOString()
    );

    expect(
      result.approval_log.filter(
        (l: any) => l.event_type === 'APPROVAL_INITIATED'
      )
    ).toHaveLength(1);
    expect(
      result.approval_log.filter(
        (l: any) => l.event_type === 'DISTRIBUTION_STARTED'
      )
    ).toHaveLength(1);
    expect(
      result.approval_log.filter(
        (l: any) => l.event_type === 'IMPLEMENTATION_PHASE_INITIATED'
      )
    ).toHaveLength(1);
    expect(
      result.approval_log.filter((l: any) => l.event_type === 'TEST_PHASE_PREPARED')
    ).toHaveLength(1);
    expect(
      result.approval_log.filter(
        (l: any) => l.event_type === 'DEPLOYMENT_PHASE_PREPARED'
      )
    ).toHaveLength(1);
  });
});