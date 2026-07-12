import { validateDeploymentGate } from '../../src/logic/it-1-1-1';

describe('本番デプロイ時の自動検証ゲート機能', () => {
  // SCEN-568
  test('検証結果が条件付き実行の場合、指定条件を満たすと本番デプロイが実行される', () => {
    const validation_results = {
      unit_test_passed: true,
      integration_test_passed: true,
      test_coverage_percent: 85,
      security_scan_critical_count: 0,
      security_scan_high_count: 0,
      validation_status: 'conditional_execution' as const,
      deployment_timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const deployment_conditions = {
      min_test_coverage_percent: 80,
      max_critical_vulnerabilities: 0,
      max_high_vulnerabilities: 0,
      require_unit_tests_passed: true,
      require_integration_tests_passed: true,
    };

    const result = validateDeploymentGate(validation_results, deployment_conditions);

    expect(result.gate_status).toBe('proceed_to_deploy');
    expect(result.is_deployment_executable).toBe(true);
    expect(result.deployment_decision_reason).toMatch(/条件を満たす|condition met|proceed/i);
    expect(result.deployment_log_entry).toHaveProperty('timestamp');
    expect(result.deployment_log_entry.status).toBe('approved_for_production');
    expect(result.deployment_log_entry.validated_coverage_percent).toBe(85);
    expect(result.deployment_log_entry.validated_critical_vulnerabilities).toBe(0);
    expect(result.deployment_log_entry.validated_high_vulnerabilities).toBe(0);
  });

  test('検証結果が条件付き実行でも、指定条件を満たさない場合、本番デプロイはブロックされる', () => {
    const validation_results = {
      unit_test_passed: true,
      integration_test_passed: false,
      test_coverage_percent: 75,
      security_scan_critical_count: 0,
      security_scan_high_count: 1,
      validation_status: 'conditional_execution' as const,
      deployment_timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const deployment_conditions = {
      min_test_coverage_percent: 80,
      max_critical_vulnerabilities: 0,
      max_high_vulnerabilities: 0,
      require_unit_tests_passed: true,
      require_integration_tests_passed: true,
    };

    const result = validateDeploymentGate(validation_results, deployment_conditions);

    expect(result.gate_status).toBe('blocked');
    expect(result.is_deployment_executable).toBe(false);
    expect(result.deployment_decision_reason).toMatch(/カバレッジ|High脆弱性|integration|coverage|vulnerability/i);
    expect(result.deployment_log_entry.status).toBe('blocked_for_production');
  });

  test('検証結果が「完全合格」の場合、本番デプロイが実行される', () => {
    const validation_results = {
      unit_test_passed: true,
      integration_test_passed: true,
      test_coverage_percent: 92,
      security_scan_critical_count: 0,
      security_scan_high_count: 0,
      validation_status: 'fully_passed' as const,
      deployment_timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const deployment_conditions = {
      min_test_coverage_percent: 80,
      max_critical_vulnerabilities: 0,
      max_high_vulnerabilities: 0,
      require_unit_tests_passed: true,
      require_integration_tests_passed: true,
    };

    const result = validateDeploymentGate(validation_results, deployment_conditions);

    expect(result.gate_status).toBe('proceed_to_deploy');
    expect(result.is_deployment_executable).toBe(true);
    expect(result.deployment_log_entry.status).toBe('approved_for_production');
  });

  test('検証結果が「失敗」の場合、本番デプロイはブロックされる', () => {
    const validation_results = {
      unit_test_passed: false,
      integration_test_passed: true,
      test_coverage_percent: 70,
      security_scan_critical_count: 1,
      security_scan_high_count: 0,
      validation_status: 'failed' as const,
      deployment_timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const deployment_conditions = {
      min_test_coverage_percent: 80,
      max_critical_vulnerabilities: 0,
      max_high_vulnerabilities: 0,
      require_unit_tests_passed: true,
      require_integration_tests_passed: true,
    };

    const result = validateDeploymentGate(validation_results, deployment_conditions);

    expect(result.gate_status).toBe('blocked');
    expect(result.is_deployment_executable).toBe(false);
    expect(result.deployment_log_entry.status).toBe('blocked_for_production');
  });

  test('テストカバレッジが最小条件を満たすエッジケース（80%ちょうど）では本番デプロイが実行される', () => {
    const validation_results = {
      unit_test_passed: true,
      integration_test_passed: true,
      test_coverage_percent: 80,
      security_scan_critical_count: 0,
      security_scan_high_count: 0,
      validation_status: 'conditional_execution' as const,
      deployment_timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const deployment_conditions = {
      min_test_coverage_percent: 80,
      max_critical_vulnerabilities: 0,
      max_high_vulnerabilities: 0,
      require_unit_tests_passed: true,
      require_integration_tests_passed: true,
    };

    const result = validateDeploymentGate(validation_results, deployment_conditions);

    expect(result.gate_status).toBe('proceed_to_deploy');
    expect(result.is_deployment_executable).toBe(true);
    expect(result.deployment_log_entry.validated_coverage_percent).toBe(80);
  });

  test('デプロイゲート検証失敗時は適切なエラーメッセージがスローされる', () => {
    const validation_results = {
      unit_test_passed: true,
      integration_test_passed: true,
      test_coverage_percent: 70,
      security_scan_critical_count: 0,
      security_scan_high_count: 0,
      validation_status: 'conditional_execution' as const,
      deployment_timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const deployment_conditions = {
      min_test_coverage_percent: 85,
      max_critical_vulnerabilities: 0,
      max_high_vulnerabilities: 0,
      require_unit_tests_passed: true,
      require_integration_tests_passed: true,
    };

    expect(() => {
      validateDeploymentGate(validation_results, deployment_conditions);
    }).toThrow(/カバレッジ|coverage/);
  });
});