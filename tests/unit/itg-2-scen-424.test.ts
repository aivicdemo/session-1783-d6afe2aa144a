import { detectUserOverlapBetweenSegments, validateStaggeredRolloutUserDistribution } from '../../src/logic/it-1-br-2-1-2-1';

describe('段階的アルゴリズムロールアウト制御機能 - ユーザー重複検証', () => {
  // SCEN-424
  test('複数セグメントに段階的配信する場合、各段階のユーザー重複がないことが検証される', () => {
    // 第1段階：セグメントA 30% （ユーザーID: 1, 2, 3）
    const stage1Users = [1, 2, 3];
    const stage1Percentage = 30;

    // 第2段階：セグメントB 40% （ユーザーID: 4, 5, 6, 7）
    const stage2Users = [4, 5, 6, 7];
    const stage2Percentage = 40;

    // 第3段階：セグメントC 30% （ユーザーID: 8, 9, 10）
    const stage3Users = [8, 9, 10];
    const stage3Percentage = 30;

    // 第1段階と第2段階のユーザー重複チェック
    const overlapStage1Stage2 = detectUserOverlapBetweenSegments(stage1Users, stage2Users);
    expect(overlapStage1Stage2.overlapUserIds).toEqual([]);
    expect(overlapStage1Stage2.overlapCount).toBe(0);

    // 第2段階と第3段階のユーザー重複チェック
    const overlapStage2Stage3 = detectUserOverlapBetweenSegments(stage2Users, stage3Users);
    expect(overlapStage2Stage3.overlapUserIds).toEqual([]);
    expect(overlapStage2Stage3.overlapCount).toBe(0);

    // 第1段階と第3段階のユーザー重複チェック
    const overlapStage1Stage3 = detectUserOverlapBetweenSegments(stage1Users, stage3Users);
    expect(overlapStage1Stage3.overlapUserIds).toEqual([]);
    expect(overlapStage1Stage3.overlapCount).toBe(0);

    // 全段階のユーザーIDをマージして重複排除後のセット数を計算
    const allStageUsers = [...stage1Users, ...stage2Users, ...stage3Users];
    const uniqueUserSet = new Set(allStageUsers);
    const uniqueUserCount = uniqueUserSet.size;

    // 各段階の合計ユーザー数
    const totalUserCount = stage1Users.length + stage2Users.length + stage3Users.length;

    // 全ユーザー数の合計が各段階の合計ユーザー数と一致することを検証
    expect(uniqueUserCount).toBe(totalUserCount);
    expect(uniqueUserCount).toBe(10);

    // 段階的ロールアウト配信の検証
    const rolloutPlan = {
      stageId: 'rollout-plan-001',
      stages: [
        {
          stageNumber: 1,
          segmentName: 'segmentA',
          userIds: stage1Users,
          rolloutPercentage: stage1Percentage,
        },
        {
          stageNumber: 2,
          segmentName: 'segmentB',
          userIds: stage2Users,
          rolloutPercentage: stage2Percentage,
        },
        {
          stageNumber: 3,
          segmentName: 'segmentC',
          userIds: stage3Users,
          rolloutPercentage: stage3Percentage,
        },
      ],
      createdAt: new Date('2024-01-15T11:00:00Z'),
    };

    const validationResult = validateStaggeredRolloutUserDistribution(rolloutPlan);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.totalUniqueUsers).toBe(10);
    expect(validationResult.overlapDetected).toBe(false);
    expect(validationResult.overlapDetails).toEqual([]);
  });
});