import { validateRuleSpecDistribution } from '../../src/logic/it-1-1-1';

describe('ルール仕様書の配布と確認追跡機能', () => {
  // SCEN-563: [normal] 配布対象外のユーザーにはルール仕様書が配布されない
  test('should not display rule specification to non-target users and track distribution status', () => {
    // ========== Setup ==========
    // 配布対象ユーザーグループの定義
    const targetUserGroup = {
      groupId: 'dev-team-001',
      groupName: 'Development Team',
    };

    // 配布対象ユーザーリスト（開発チームメンバーのみ）
    const targetUserIds = ['user-dev-001', 'user-dev-002', 'user-dev-003'];

    // 配布対象外ユーザーアカウント
    const nonTargetUserId = 'user-non-target-001';
    const nonTargetUserName = 'Non-Target User';

    // ルール仕様書の配布情報
    const ruleSpecification = {
      specId: 'rule-spec-2024-q1',
      title: '2024年Q1季節パターン・割引率閾値・販売期間ルール',
      version: '1.0',
      releaseDate: '2024-01-01T09:00:00Z',
      distributionTargetGroupId: 'dev-team-001',
      distributionTargetUserIds: targetUserIds,
      content: 'Rule specification content for Q1 seasonal patterns...',
      status: 'distributed',
    };

    // 配布追跡情報：配布対象ユーザーのみが確認状態を記録
    const distributionTracking = {
      specId: 'rule-spec-2024-q1',
      distributedAt: '2024-01-01T09:00:00Z',
      targetGroupId: 'dev-team-001',
      targetUserCount: 3,
      confirmedUserIds: ['user-dev-001', 'user-dev-002'], // 2名が確認
      unconfirmedUserIds: ['user-dev-003'], // 1名未確認
      nonTargetUserIds: ['user-non-target-001'], // 配布対象外
    };

    // ========== Execution ==========
    const result = validateRuleSpecDistribution({
      ruleSpecId: 'rule-spec-2024-q1',
      requestingUserId: nonTargetUserId,
      requestingUserName: nonTargetUserName,
      targetUserIds: targetUserIds,
      distributionStatus: distributionTracking,
    });

    // ========== Assertion ==========
    // 配布対象外ユーザーのアクセス結果：拒否されること
    expect(result.isUserTargeted).toBe(false);
    expect(result.canAccessSpecification).toBe(false);
    expect(result.accessDeniedReason).toBe('user_not_in_distribution_target');

    // 配布対象外ユーザーの情報が追跡記録に含まれていること
    expect(result.distributionTracking.nonTargetUserIds).toContain(
      nonTargetUserId
    );
    expect(result.distributionTracking.targetUserCount).toBe(3);
    expect(result.distributionTracking.confirmedUserIds.length).toBe(2);
    expect(result.distributionTracking.unconfirmedUserIds.length).toBe(1);

    // 管理者が配布対象外ユーザーの状態を確認追跡できること
    expect(result.adminCanTrackDistribution).toBe(true);
    expect(result.userDistributionStatus).toEqual({
      userId: nonTargetUserId,
      isTargeted: false,
      isConfirmed: false,
      confirmedAt: null,
    });

    // 配布状態の集計が正確であること
    expect(result.distributionSummary).toEqual({
      totalTargetUsers: 3,
      confirmedCount: 2,
      unconfirmedCount: 1,
      nonTargetUserCount: 1,
      distributionCompletionRate: 66.67, // (2 / 3) * 100
    });
  });
});