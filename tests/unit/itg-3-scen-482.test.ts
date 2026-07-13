import { determineDeploymentApproval } from '../../src/logic/it-1-br-3-2-1';

describe('献立生成アルゴリズム新ルール本番デプロイの自動検証ゲート', () => {
  // SCEN-482
  test('テスト環境での検証結果が全て合格の場合、本番デプロイ実行可能の判定が出力される', () => {
    const test_environment_verification_results = {
      functional_test_status: 'PASS',
      performance_test_status: 'PASS',
      compatibility_test_status: 'PASS',
      security_test_status: 'PASS',
      regression_test_status: 'PASS',
      nutritional_validation_status: 'PASS',
      family_constraint_validation_status: 'PASS',
      user_preference_validation_status: 'PASS',
    };

    const deployment_decision = determineDeploymentApproval(
      test_environment_verification_results
    );

    expect(deployment_decision).toEqual({
      deployment_approved: true,
      deployment_action: '本番デプロイ実行可能',
      deployment_status: '承認済み',
      all_tests_passed: true,
      passed_test_count: 8,
      failed_test_count: 0,
      deployment_ready_timestamp: expect.any(String),
    });
  });

  test('テスト環境での検証結果に1つ以上の不合格がある場合、本番デプロイ実行不可の判定が出力される', () => {
    const test_environment_verification_results_with_failure = {
      functional_test_status: 'PASS',
      performance_test_status: 'FAIL',
      compatibility_test_status: 'PASS',
      security_test_status: 'PASS',
      regression_test_status: 'PASS',
      nutritional_validation_status: 'PASS',
      family_constraint_validation_status: 'PASS',
      user_preference_validation_status: 'PASS',
    };

    const deployment_decision = determineDeploymentApproval(
      test_environment_verification_results_with_failure
    );

    expect(deployment_decision).toEqual({
      deployment_approved: false,
      deployment_action: 'デプロイ実行不可',
      deployment_status: '却下',
      all_tests_passed: false,
      passed_test_count: 7,
      failed_test_count: 1,
      failed_tests: ['performance_test_status'],
      deployment_ready_timestamp: null,
    });
  });

  test('複数の検証項目が不合格の場合、全ての不合格項目が明示される', () => {
    const test_environment_verification_results_multiple_failures = {
      functional_test_status: 'FAIL',
      performance_test_status: 'FAIL',
      compatibility_test_status: 'PASS',
      security_test_status: 'PASS',
      regression_test_status: 'PASS',
      nutritional_validation_status: 'PASS',
      family_constraint_validation_status: 'PASS',
      user_preference_validation_status: 'FAIL',
    };

    const deployment_decision = determineDeploymentApproval(
      test_environment_verification_results_multiple_failures
    );

    expect(deployment_decision).toEqual({
      deployment_approved: false,
      deployment_action: 'デプロイ実行不可',
      deployment_status: '却下',
      all_tests_passed: false,
      passed_test_count: 5,
      failed_test_count: 3,
      failed_tests: [
        'functional_test_status',
        'performance_test_status',
        'user_preference_validation_status',
      ],
      deployment_ready_timestamp: null,
    });
  });

  test('不正な検証ステータスが渡された場合、エラーが発生する', () => {
    const invalid_verification_results = {
      functional_test_status: 'UNKNOWN',
      performance_test_status: 'PASS',
      compatibility_test_status: 'PASS',
      security_test_status: 'PASS',
      regression_test_status: 'PASS',
      nutritional_validation_status: 'PASS',
      family_constraint_validation_status: 'PASS',
      user_preference_validation_status: 'PASS',
    };

    expect(() =>
      determineDeploymentApproval(invalid_verification_results)
    ).toThrow(/検証ステータス/);
  });

  test('必須の検証項目が欠落している場合、エラーが発生する', () => {
    const incomplete_verification_results = {
      functional_test_status: 'PASS',
      performance_test_status: 'PASS',
      compatibility_test_status: 'PASS',
      security_test_status: 'PASS',
      regression_test_status: 'PASS',
      nutritional_validation_status: 'PASS',
      family_constraint_validation_status: 'PASS',
    };

    expect(() =>
      determineDeploymentApproval(incomplete_verification_results)
    ).toThrow(/必須項目/);
  });
});