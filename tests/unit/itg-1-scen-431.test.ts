import { selectRolloutSegmentsAndDeterminePlan } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-431: [normal] ユーザーセグメント別段階的ロールアウト選定機能
  test('承認済みアルゴリズムに対してユーザーセグメント別にロールアウト対象を段階的に選定し、デプロイ順序と対象ユーザー数を決定できる', () => {
    const approvedAlgorithmId = 'algo_v2_20240115';
    const algorithmVersion = '2.0';
    const approvalDate = new Date('2024-01-15T10:00:00Z');

    const availableSegments = [
      {
        segmentId: 'seg_test_users',
        segmentName: 'テストユーザー',
        totalUserCount: 50,
        description: 'アプリ内テスト用ユーザーグループ',
      },
      {
        segmentId: 'seg_existing_users',
        segmentName: '既存ユーザー',
        totalUserCount: 2500,
        description: '前月以前からアプリ利用中の専業主夫ユーザー',
      },
      {
        segmentId: 'seg_all_users',
        segmentName: '全ユーザー',
        totalUserCount: 5000,
        description: 'アプリ登録済みの全ユーザー',
      },
    ];

    const rolloutPlan = {
      stage1: {
        segmentId: 'seg_test_users',
        segmentName: 'テストユーザー',
        targetUserCount: 50,
        deploymentDateTime: new Date('2024-01-22T09:00:00Z'),
        stageOrder: 1,
      },
      stage2: {
        segmentId: 'seg_existing_users',
        segmentName: '既存ユーザー',
        targetUserCount: 2500,
        deploymentDateTime: new Date('2024-01-29T09:00:00Z'),
        stageOrder: 2,
      },
      stage3: {
        segmentId: 'seg_all_users',
        segmentName: '全ユーザー',
        targetUserCount: 5000,
        deploymentDateTime: new Date('2024-02-05T09:00:00Z'),
        stageOrder: 3,
      },
    };

    const result = selectRolloutSegmentsAndDeterminePlan({
      algorithmId: approvedAlgorithmId,
      algorithmVersion: algorithmVersion,
      approvalDate: approvalDate,
      availableSegments: availableSegments,
      requestedRolloutPlan: rolloutPlan,
    });

    // 段階的ロールアウト計画が正しく選定されていることを検証
    expect(result.algorithmId).toBe(approvedAlgorithmId);
    expect(result.algorithmVersion).toBe(algorithmVersion);
    expect(result.isPhased).toBe(true);
    expect(result.totalPhases).toBe(3);

    // 第1段階: テストユーザー
    expect(result.phases[0].stageOrder).toBe(1);
    expect(result.phases[0].segmentId).toBe('seg_test_users');
    expect(result.phases[0].segmentName).toBe('テストユーザー');
    expect(result.phases[0].targetUserCount).toBe(50);
    expect(result.phases[0].deploymentDateTime).toEqual(
      new Date('2024-01-22T09:00:00Z')
    );

    // 第2段階: 既存ユーザー
    expect(result.phases[1].stageOrder).toBe(2);
    expect(result.phases[1].segmentId).toBe('seg_existing_users');
    expect(result.phases[1].segmentName).toBe('既存ユーザー');
    expect(result.phases[1].targetUserCount).toBe(2500);
    expect(result.phases[1].deploymentDateTime).toEqual(
      new Date('2024-01-29T09:00:00Z')
    );

    // 第3段階: 全ユーザー
    expect(result.phases[2].stageOrder).toBe(3);
    expect(result.phases[2].segmentId).toBe('seg_all_users');
    expect(result.phases[2].segmentName).toBe('全ユーザー');
    expect(result.phases[2].targetUserCount).toBe(5000);
    expect(result.phases[2].deploymentDateTime).toEqual(
      new Date('2024-02-05T09:00:00Z')
    );

    // デプロイ順序が昇順で正しく設定されていることを検証
    expect(result.phases[0].stageOrder).toBeLessThan(
      result.phases[1].stageOrder
    );
    expect(result.phases[1].stageOrder).toBeLessThan(
      result.phases[2].stageOrder
    );

    // 各段階のデプロイ日時が段階的に後になっていることを検証
    expect(result.phases[0].deploymentDateTime.getTime()).toBeLessThan(
      result.phases[1].deploymentDateTime.getTime()
    );
    expect(result.phases[1].deploymentDateTime.getTime()).toBeLessThan(
      result.phases[2].deploymentDateTime.getTime()
    );

    // ロールアウト計画の確定状態を検証
    expect(result.status).toBe('confirmed');
    expect(result.isConfirmed).toBe(true);

    // ロールアウト履歴情報が保存されていることを検証
    expect(result.rolloutHistory).toBeDefined();
    expect(result.rolloutHistory.createdAt).toBeDefined();
    expect(result.rolloutHistory.confirmedAt).toBeDefined();
    expect(result.rolloutHistory.confirmedBy).toBe('admin');

    // 全段階のデプロイ対象ユーザー数の合計が正しく計算されていることを検証
    const totalTargetUsers = result.phases.reduce(
      (sum, phase) => sum + phase.targetUserCount,
      0
    );
    expect(totalTargetUsers).toBe(7550);

    // 段階別展開スケジュール情報が正確に記録されていることを検証
    expect(result.rolloutSchedule).toBeDefined();
    expect(result.rolloutSchedule.length).toBe(3);
    expect(result.rolloutSchedule[0].phase).toBe(1);
    expect(result.rolloutSchedule[1].phase).toBe(2);
    expect(result.rolloutSchedule[2].phase).toBe(3);
  });
});