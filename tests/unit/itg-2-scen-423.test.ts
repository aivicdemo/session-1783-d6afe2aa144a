import { validateRolloutWithUndefinedVersion } from '../../src/logic/it-1-br-2-1-2-1';

describe('段階的アルゴリズムロールアウト制御機能', () => {
  test('SCEN-423: 検証期間中のアルゴリズムバージョンが未決定の場合、ロールアウトが中断される', () => {
    // 準備: ロールアウト計画データ（検証期間中のバージョンが未決定）
    const rolloutPlan = {
      rolloutId: 'rollout-20240115-001',
      planName: '献立生成アルゴリズムv2.5段階的ロールアウト',
      createdAt: new Date('2024-01-15T10:00:00Z'),
      rolloutStatus: 'ready', // ロールアウト開始前の状態
      verificationStartDate: new Date('2024-01-20T00:00:00Z'),
      verificationEndDate: new Date('2024-01-27T23:59:59Z'),
      algorithmVersionDuringVerification: null, // 未決定状態
      userSegments: [
        {
          segmentId: 'segment-homemaker-30s',
          segmentName: '30代専業主夫層',
          rolloutPercentage: 20,
        },
      ],
      rolloutStartButton: true, // ユーザーがロールアウト開始ボタンをクリック
    };

    // 実行: ロールアウト検証関数を呼び出す
    const result = validateRolloutWithUndefinedVersion(rolloutPlan);

    // 検証: ロールアウトが中断され、適切なエラーメッセージが返される
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('suspended');
    expect(result.errorMessage).toMatch(/検証期間中のアルゴリズムバージョン/);
    expect(result.errorMessage).toMatch(/未決定/);
    expect(result.errorMessage).toMatch(/決定/);

    // 検証: ロールアウトステータスが『中断』に更新される
    expect(result.updatedRolloutStatus).toBe('suspended');

    // 検証: システムログにエラーイベントが記録される
    expect(result.systemLogEvent).toBeDefined();
    expect(result.systemLogEvent.eventType).toBe('rollout_suspended');
    expect(result.systemLogEvent.timestamp).toBeDefined();
    expect(result.systemLogEvent.reason).toMatch(/アルゴリズムバージョン/);

    // 検証: ユーザーが次のアクション（バージョン決定後のロールアウト再開）を実行可能な状態
    expect(result.canRetryAfterVersionDecision).toBe(true);
    expect(result.requiredAction).toMatch(/バージョン決定/);
  });
});