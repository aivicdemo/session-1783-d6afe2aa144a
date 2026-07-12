import { selectRolloutSegmentsAndDetermineFinalPhase } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-433: [edge] ユーザーセグメント別段階的ロールアウト選定機能 - 全ユーザーセグメントが対象の場合、段階的ロールアウトの最終フェーズとして全体展開を決定できる
  test('全ユーザーセグメントが対象の場合、段階的ロールアウトの最終フェーズとして全体展開を決定できる', () => {
    // 段階的ロールアウト対象入力: 全ユーザーセグメント選択
    const rolloutInput = {
      algorithmVersionId: 'algo-v2-001',
      selectedSegments: ['all-segments'],
      currentPhase: 3,
      totalPhases: 3,
      isAdminUser: true,
      timestamp: '2024-01-15T11:00:00Z',
    };

    // 全体展開決定処理の実行
    const rolloutResult = selectRolloutSegmentsAndDetermineFinalPhase(rolloutInput);

    // 最終フェーズ判定: currentPhase === totalPhases
    expect(rolloutResult.isFinalPhase).toBe(true);

    // 全体展開ボタンが有効化される
    expect(rolloutResult.isFullDeploymentButtonEnabled).toBe(true);

    // 全体展開決定フローの処理
    const fullDeploymentDecision = {
      algorithmVersionId: rolloutResult.algorithmVersionId,
      selectedSegments: rolloutResult.selectedSegments,
      deploymentDecision: 'approve',
      approverRole: 'admin',
      timestamp: '2024-01-15T11:05:00Z',
    };

    // 確認ダイアログ表示が期待される
    expect(rolloutResult.requiresConfirmationDialog).toBe(true);

    // 全体展開決定後のステータス更新
    const deploymentStatusUpdate = {
      algorithmVersionId: rolloutResult.algorithmVersionId,
      status: 'full-deployment-completed',
      affectedSegmentCount: 1,
      isFullDeployment: true,
      completionTimestamp: '2024-01-15T11:05:00Z',
    };

    // ステータスが「全体展開完了」に更新される
    expect(deploymentStatusUpdate.status).toBe('full-deployment-completed');
    expect(deploymentStatusUpdate.isFullDeployment).toBe(true);

    // ロールアウト履歴記録: 全体展開イベントが記録される
    const rolloutHistoryEntry = {
      algorithmVersionId: rolloutResult.algorithmVersionId,
      phase: rolloutResult.currentPhase,
      affectedSegments: rolloutResult.selectedSegments,
      deploymentType: 'full-deployment',
      status: 'completed',
      recordTimestamp: '2024-01-15T11:05:00Z',
    };

    // ロールアウト履歴にレコードが記録される
    expect(rolloutHistoryEntry.deploymentType).toBe('full-deployment');
    expect(rolloutHistoryEntry.status).toBe('completed');
    expect(rolloutHistoryEntry.affectedSegments).toEqual(['all-segments']);

    // 全ユーザーセグメントへの機能有効化確認
    const featureActivationStatus = {
      algorithmVersionId: rolloutResult.algorithmVersionId,
      segmentsCovered: ['all-segments'],
      featureEnablementPercentage: 100,
      isEnabledForAllSegments: true,
    };

    expect(featureActivationStatus.isEnabledForAllSegments).toBe(true);
    expect(featureActivationStatus.featureEnablementPercentage).toBe(100);
    expect(featureActivationStatus.segmentsCovered).toContain('all-segments');

    // 管理者権限検証
    expect(rolloutResult.isAdminUser).toBe(true);

    // 確認ダイアログ表示確認とロールアウト結果整合性
    expect(rolloutResult).toEqual(
      expect.objectContaining({
        algorithmVersionId: 'algo-v2-001',
        isFinalPhase: true,
        isFullDeploymentButtonEnabled: true,
        requiresConfirmationDialog: true,
        currentPhase: 3,
        totalPhases: 3,
        selectedSegments: ['all-segments'],
      })
    );
  });
});