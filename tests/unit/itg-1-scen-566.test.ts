import { executeDeploymentValidationGate } from '../../src/logic/it-1-1-1';

describe('本番デプロイ時の自動検証ゲート機能', () => {
  // SCEN-566
  test('[normal] デプロイ前の自動検証で合格判定を受けた場合、本番デプロイが実行される', () => {
    const mockDeployFunction = jest.fn().mockResolvedValue({
      deployment_id: 'deploy-20250115-001',
      environment: 'production',
      status: 'success',
      timestamp: '2025-01-15T11:00:00Z',
    });

    const validation_results = {
      unit_tests: {
        passed: 156,
        failed: 0,
        skipped: 2,
        status: 'passed',
      },
      integration_tests: {
        passed: 48,
        failed: 0,
        skipped: 1,
        status: 'passed',
      },
      security_scan: {
        critical_issues: 0,
        high_issues: 0,
        medium_issues: 2,
        low_issues: 5,
        status: 'passed',
      },
      code_coverage: {
        statement_coverage: 92.5,
        branch_coverage: 88.3,
        function_coverage: 94.1,
        line_coverage: 91.8,
        minimum_threshold: 80.0,
        status: 'passed',
      },
      performance_tests: {
        meal_generation_time_ms: 342,
        maximum_allowed_ms: 500,
        memory_usage_mb: 156,
        maximum_allowed_mb: 512,
        status: 'passed',
      },
    };

    const deployment_config = {
      target_environment: 'production',
      algorithm_version: 'v2.3.1',
      rollback_enabled: true,
      canary_deployment: false,
      deploy_function: mockDeployFunction,
    };

    const result = executeDeploymentValidationGate(
      validation_results,
      deployment_config,
    );

    expect(result.validation_gate_status).toBe('passed');
    expect(result.all_checks_passed).toBe(true);
    expect(result.deployment_executed).toBe(true);

    expect(result.validation_summary).toEqual({
      unit_tests_status: 'passed',
      integration_tests_status: 'passed',
      security_scan_status: 'passed',
      code_coverage_status: 'passed',
      performance_tests_status: 'passed',
    });

    expect(result.deployment_details).toEqual({
      deployment_id: 'deploy-20250115-001',
      environment: 'production',
      status: 'success',
      timestamp: '2025-01-15T11:00:00Z',
    });

    expect(mockDeployFunction).toHaveBeenCalledTimes(1);
    expect(mockDeployFunction).toHaveBeenCalledWith({
      environment: 'production',
      version: 'v2.3.1',
      rollback_enabled: true,
    });

    expect(result.deployment_executed).toBe(true);
    expect(result.validation_gate_status).toBe('passed');
    expect(result.all_checks_passed).toBe(true);
  });
});