import { computeWeeklyMetricsAggregation } from '../../src/logic/it-7-2-1';

describe('Weekly Metrics Aggregation for Algorithm Improvement Dashboard', () => {
  // SCEN-839: Multiple rule specification sheets distributed simultaneously with independent parallel processing
  test('should process multiple rule specification sheets in parallel with independent workflows', async () => {
    fetchMock.resetMocks();

    // Setup: 3 rule specification sheets prepared for distribution
    const ruleSpec1 = {
      id: 'rule-001',
      name: 'Seasonal Pattern v1.0',
      version: '1.0',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      status: 'ready_for_distribution',
      content: {
        seasonalPatterns: [
          { season: 'spring', priority: 85, items: ['spring_vegetable_01'] },
          { season: 'summer', priority: 75, items: ['summer_fruit_01'] },
        ],
      },
    };

    const ruleSpec2 = {
      id: 'rule-002',
      name: 'Discount Threshold v2.0',
      version: '2.0',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      status: 'ready_for_distribution',
      content: {
        discountThresholds: [
          { category: 'meat', threshold: 20, priority: 90 },
          { category: 'dairy', threshold: 15, priority: 70 },
        ],
      },
    };

    const ruleSpec3 = {
      id: 'rule-003',
      name: 'Sales Period v1.5',
      version: '1.5',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      status: 'ready_for_distribution',
      content: {
        salesPeriods: [
          { campaign: 'new_year_sale', startDate: '2024-01-01', endDate: '2024-01-31', priority: 95 },
          { campaign: 'seasonal_promo', startDate: '2024-03-01', endDate: '2024-03-31', priority: 80 },
        ],
      },
    };

    // Mock API: Distribute all 3 sheets simultaneously (timestamp within 0ms)
    const distributionTimestamp = '2024-01-15T09:30:00.000Z';
    fetchMock.mockResponseOnce(
      JSON.stringify({
        distributionId: 'dist-batch-001',
        timestamp: distributionTimestamp,
        sheets: [ruleSpec1, ruleSpec2, ruleSpec3],
        status: 'distributed',
        parallelFlows: 3,
      }),
      { status: 200 }
    );

    // Mock API: Fetch workflow status for sheet 1
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ruleSpecId: 'rule-001',
        workflowId: 'wf-001',
        currentStep: 'awaiting_approval',
        approvers: [
          { userId: 'user-001', role: 'product_manager', status: 'pending' },
          { userId: 'user-002', role: 'dev_team_lead', status: 'pending' },
        ],
        createdAt: distributionTimestamp,
        lastUpdatedAt: distributionTimestamp,
      }),
      { status: 200 }
    );

    // Mock API: Fetch workflow status for sheet 2
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ruleSpecId: 'rule-002',
        workflowId: 'wf-002',
        currentStep: 'awaiting_approval',
        approvers: [
          { userId: 'user-003', role: 'product_manager', status: 'pending' },
          { userId: 'user-004', role: 'dev_team_lead', status: 'pending' },
        ],
        createdAt: distributionTimestamp,
        lastUpdatedAt: distributionTimestamp,
      }),
      { status: 200 }
    );

    // Mock API: Fetch workflow status for sheet 3
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ruleSpecId: 'rule-003',
        workflowId: 'wf-003',
        currentStep: 'awaiting_approval',
        approvers: [
          { userId: 'user-005', role: 'product_manager', status: 'pending' },
          { userId: 'user-006', role: 'dev_team_lead', status: 'pending' },
        ],
        createdAt: distributionTimestamp,
        lastUpdatedAt: distributionTimestamp,
      }),
      { status: 200 }
    );

    // Mock API: Approve sheet 1 by first approver at T+30s
    const approvalTime1 = '2024-01-15T09:30:30Z';
    fetchMock.mockResponseOnce(
      JSON.stringify({
        workflowId: 'wf-001',
        ruleSpecId: 'rule-001',
        approvalStep: 1,
        approverUserId: 'user-001',
        decision: 'approved',
        timestamp: approvalTime1,
        nextStep: 'dev_team_review',
      }),
      { status: 200 }
    );

    // Mock API: Approve sheet 2 by first approver at T+25s (different timing)
    const approvalTime2 = '2024-01-15T09:30:25Z';
    fetchMock.mockResponseOnce(
      JSON.stringify({
        workflowId: 'wf-002',
        ruleSpecId: 'rule-002',
        approvalStep: 1,
        approverUserId: 'user-003',
        decision: 'approved',
        timestamp: approvalTime2,
        nextStep: 'dev_team_review',
      }),
      { status: 200 }
    );

    // Mock API: Reject sheet 3 by first approver at T+20s (different outcome)
    const rejectionTime3 = '2024-01-15T09:30:20Z';
    fetchMock.mockResponseOnce(
      JSON.stringify({
        workflowId: 'wf-003',
        ruleSpecId: 'rule-003',
        approvalStep: 1,
        approverUserId: 'user-005',
        decision: 'rejected',
        reason: 'requires_additional_testing',
        timestamp: rejectionTime3,
        nextStep: 'revision_requested',
      }),
      { status: 200 }
    );

    // Mock API: Query transaction logs for all 3 workflows
    fetchMock.mockResponseOnce(
      JSON.stringify({
        transactionLogs: [
          {
            sessionId: 'session-wf-001',
            workflowId: 'wf-001',
            ruleSpecId: 'rule-001',
            operations: [
              { timestamp: distributionTimestamp, operation: 'distributed', status: 'success' },
              { timestamp: approvalTime1, operation: 'approved', status: 'success' },
              { timestamp: '2024-01-15T09:30:45Z', operation: 'dev_review_started', status: 'success' },
            ],
          },
          {
            sessionId: 'session-wf-002',
            workflowId: 'wf-002',
            ruleSpecId: 'rule-002',
            operations: [
              { timestamp: distributionTimestamp, operation: 'distributed', status: 'success' },
              { timestamp: approvalTime2, operation: 'approved', status: 'success' },
              { timestamp: '2024-01-15T09:30:40Z', operation: 'dev_review_started', status: 'success' },
            ],
          },
          {
            sessionId: 'session-wf-003',
            workflowId: 'wf-003',
            ruleSpecId: 'rule-003',
            operations: [
              { timestamp: distributionTimestamp, operation: 'distributed', status: 'success' },
              { timestamp: rejectionTime3, operation: 'rejected', status: 'success' },
              { timestamp: '2024-01-15T09:30:35Z', operation: 'revision_requested', status: 'success' },
            ],
          },
        ],
        allSessionsIndependent: true,
      }),
      { status: 200 }
    );

    // Call the function under test
    const result = await computeWeeklyMetricsAggregation({
      distributionBatchId: 'dist-batch-001',
      ruleSpecIds: ['rule-001', 'rule-002', 'rule-003'],
      distributionTimestamp,
      operationType: 'parallel_workflow_processing',
    });

    // Assertion 1: All 3 workflows were created and distributed
    expect(result.parallelFlowsInitiated).toBe(3);
    expect(result.distributionStatus).toBe('success');
    expect(result.timestamp).toBe(distributionTimestamp);

    // Assertion 2: Each workflow maintained independent status
    expect(result.workflowStatuses).toEqual([
      {
        workflowId: 'wf-001',
        ruleSpecId: 'rule-001',
        currentStep: 'dev_team_review',
        approvalTimestamp: approvalTime1,
        decision: 'approved',
        sessionId: 'session-wf-001',
      },
      {
        workflowId: 'wf-002',
        ruleSpecId: 'rule-002',
        currentStep: 'dev_team_review',
        approvalTimestamp: approvalTime2,
        decision: 'approved',
        sessionId: 'session-wf-002',
      },
      {
        workflowId: 'wf-003',
        ruleSpecId: 'rule-003',
        currentStep: 'revision_requested',
        approvalTimestamp: rejectionTime3,
        decision: 'rejected',
        sessionId: 'session-wf-003',
      },
    ]);

    // Assertion 3: No cross-workflow interference detected
    expect(result.workflowInterferenceDetected).toBe(false);

    // Assertion 4: Each workflow processed with independent session
    expect(result.transactionLogsVerified).toBe(true);
    expect(result.allSessionsIndependent).toBe(true);

    // Assertion 5: Final state consistency across all workflows
    expect(result.finalStateConsistency).toEqual({
      sheet1Status: 'in_progress',
      sheet2Status: 'in_progress',
      sheet3Status: 'pending_revision',
      auditLogsComplete: true,
      timestampIntegrity: true,
    });

    // Assertion 6: No blocking detected - parallel execution confirmed
    expect(result.blockingDetected).toBe(false);
    expect(result.parallelExecutionConfirmed).toBe(true);

    // Assertion 7: All notifications sent independently
    expect(result.notificationsSentPerFlow).toEqual({
      wf001: 1,
      wf002: 1,
      wf003: 1,
    });

    // Assertion 8: Verify metrics aggregation for dashboard
    expect(result.metricsAggregation).toEqual({
      totalWorkflowsProcessed: 3,
      successfulCompletions: 0,
      approvalsReceived: 2,
      rejectionsReceived: 1,
      avgProcessingTimeMs: expect.any(Number),
      parallelThroughput: 3,
    });

    // Assertion 9: Audit trail shows no data corruption
    expect(result.auditTrailIntegrity).toBe(true);
    expect(result.dataIntegrityVerified).toBe(true);
  });
});