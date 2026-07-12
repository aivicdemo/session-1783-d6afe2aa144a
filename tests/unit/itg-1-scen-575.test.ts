import { approveRuleSpecificationFlow } from '../../src/logic/it-1-1-1';

describe('ルール仕様承認フロー自動進行', () => {
  // SCEN-575
  test('ルール仕様書配布時に実装・テスト・本番デプロイ承認フローが順序通り自動で開始される', () => {
    const ruleSpecificationId = 'rule-spec-2024-q1-001';
    const distributionTimestamp = new Date('2024-01-15T09:00:00Z');
    const teamMembers = [
      { userId: 'dev-001', role: 'implementation' },
      { userId: 'qa-001', role: 'testing' },
      { userId: 'ops-001', role: 'deployment' },
    ];

    const result = approveRuleSpecificationFlow({
      ruleSpecificationId,
      distributionTimestamp,
      teamMembers,
    });

    // 初期状態: 実装承認ステージが自動で開始される
    expect(result.implementationStage.status).toBe('started');
    expect(result.implementationStage.startedAt).toEqual(distributionTimestamp);
    expect(result.implementationStage.assignedUserId).toBe('dev-001');

    // テスト承認ステージはまだ待機中
    expect(result.testingStage.status).toBe('pending');
    expect(result.testingStage.startedAt).toBeNull();

    // 本番デプロイ承認ステージはまだ待機中
    expect(result.deploymentStage.status).toBe('pending');
    expect(result.deploymentStage.startedAt).toBeNull();

    // 遷移履歴が記録される
    expect(result.transitionHistory.length).toBe(1);
    expect(result.transitionHistory[0].fromStage).toBeNull();
    expect(result.transitionHistory[0].toStage).toBe('implementation');
    expect(result.transitionHistory[0].timestamp).toEqual(distributionTimestamp);

    // 実装承認完了時、テスト承認ステージが自動で開始される
    const implementationApprovedTimestamp = new Date('2024-01-15T14:30:00Z');
    const resultAfterImplementation = approveRuleSpecificationFlow({
      ruleSpecificationId,
      distributionTimestamp,
      teamMembers,
      currentStage: 'implementation',
      previousStageApprovedAt: implementationApprovedTimestamp,
    });

    expect(resultAfterImplementation.implementationStage.status).toBe('completed');
    expect(resultAfterImplementation.implementationStage.completedAt).toEqual(
      implementationApprovedTimestamp
    );

    expect(resultAfterImplementation.testingStage.status).toBe('started');
    expect(resultAfterImplementation.testingStage.startedAt).toEqual(
      implementationApprovedTimestamp
    );
    expect(resultAfterImplementation.testingStage.assignedUserId).toBe('qa-001');

    expect(resultAfterImplementation.deploymentStage.status).toBe('pending');

    // テスト承認完了時、本番デプロイ承認ステージが自動で開始される
    const testingApprovedTimestamp = new Date('2024-01-16T10:15:00Z');
    const resultAfterTesting = approveRuleSpecificationFlow({
      ruleSpecificationId,
      distributionTimestamp,
      teamMembers,
      currentStage: 'testing',
      previousStageApprovedAt: testingApprovedTimestamp,
    });

    expect(resultAfterTesting.testingStage.status).toBe('completed');
    expect(resultAfterTesting.testingStage.completedAt).toEqual(testingApprovedTimestamp);

    expect(resultAfterTesting.deploymentStage.status).toBe('started');
    expect(resultAfterTesting.deploymentStage.startedAt).toEqual(testingApprovedTimestamp);
    expect(resultAfterTesting.deploymentStage.assignedUserId).toBe('ops-001');

    // 遷移履歴の整合性確認
    expect(resultAfterTesting.transitionHistory.length).toBe(3);

    const transitionRecords = resultAfterTesting.transitionHistory;
    expect(transitionRecords[0].toStage).toBe('implementation');
    expect(transitionRecords[0].timestamp).toEqual(distributionTimestamp);

    expect(transitionRecords[1].fromStage).toBe('implementation');
    expect(transitionRecords[1].toStage).toBe('testing');
    expect(transitionRecords[1].timestamp).toEqual(implementationApprovedTimestamp);

    expect(transitionRecords[2].fromStage).toBe('testing');
    expect(transitionRecords[2].toStage).toBe('deployment');
    expect(transitionRecords[2].timestamp).toEqual(testingApprovedTimestamp);

    // 各ステージのタイムスタンプの順序が正確に記録されていること
    expect(
      transitionRecords[0].timestamp < transitionRecords[1].timestamp
    ).toBe(true);
    expect(
      transitionRecords[1].timestamp < transitionRecords[2].timestamp
    ).toBe(true);

    // 全承認フロー完了後のステータス
    const resultAfterDeployment = approveRuleSpecificationFlow({
      ruleSpecificationId,
      distributionTimestamp,
      teamMembers,
      currentStage: 'deployment',
      previousStageApprovedAt: new Date('2024-01-16T15:45:00Z'),
    });

    expect(resultAfterDeployment.deploymentStage.status).toBe('completed');
    expect(resultAfterDeployment.deploymentStage.completedAt).toEqual(
      new Date('2024-01-16T15:45:00Z')
    );
    expect(resultAfterDeployment.overallStatus).toBe('all_stages_completed');
  });
});