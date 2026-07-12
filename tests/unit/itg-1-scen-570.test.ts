import { validateDeploymentGate } from '../../src/logic/it-1-1-1';

describe('本番デプロイ時の自動検証ゲート機能', () => {
  // SCEN-570
  test('検証所要時間が0秒の場合、タイムアウト判定されない', async () => {
    const deploymentGateInput = {
      deploymentId: 'deploy-2024-0115-001',
      algorithmVersion: 'v2.1.0',
      regressionTestDurationMs: 0,
      timeoutThresholdMs: 5000,
      validationRules: [
        {
          ruleId: 'rule-nutrition-balance',
          description: 'Nutrition balance constraint',
          passCriteria: 0.95,
        },
        {
          ruleId: 'rule-family-preference',
          description: 'Family preference learning',
          passCriteria: 0.90,
        },
        {
          ruleId: 'rule-allergy-safety',
          description: 'Allergy safety validation',
          passCriteria: 1.0,
        },
      ],
    };

    const validationExecutionStartTime = new Date('2024-01-15T09:00:00Z').getTime();
    const validationExecutionEndTime = new Date('2024-01-15T09:00:00Z').getTime();
    const actualValidationDurationMs = validationExecutionEndTime - validationExecutionStartTime;

    const validationResults = {
      'rule-nutrition-balance': 0.98,
      'rule-family-preference': 0.92,
      'rule-allergy-safety': 1.0,
    };

    const result = await validateDeploymentGate({
      deploymentId: deploymentGateInput.deploymentId,
      algorithmVersion: deploymentGateInput.algorithmVersion,
      validationDurationMs: actualValidationDurationMs,
      timeoutThresholdMs: deploymentGateInput.timeoutThresholdMs,
      validationRules: deploymentGateInput.validationRules,
      validationResults: validationResults,
    });

    expect(result.deploymentId).toBe('deploy-2024-0115-001');
    expect(result.algorithmVersion).toBe('v2.1.0');
    expect(result.validationDurationMs).toBe(0);
    expect(result.isTimedOut).toBe(false);
    expect(result.timeoutDetected).toBe(false);
    expect(result.validationStatus).toBe('success');
    expect(result.allRulesPassed).toBe(true);
    expect(result.errorLog).toHaveLength(0);
    expect(result.failedRules).toHaveLength(0);
    expect(result.ruleResults).toEqual({
      'rule-nutrition-balance': {
        actualScore: 0.98,
        passCriteria: 0.95,
        isPassed: true,
      },
      'rule-family-preference': {
        actualScore: 0.92,
        passCriteria: 0.90,
        isPassed: true,
      },
      'rule-allergy-safety': {
        actualScore: 1.0,
        passCriteria: 1.0,
        isPassed: true,
      },
    });
    expect(result.deploymentAllowed).toBe(true);
  });
});