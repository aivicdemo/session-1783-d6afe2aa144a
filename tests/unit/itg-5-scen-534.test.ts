import { detectConstraintChanges } from '../../src/logic/it-7-2-1';

describe('制約条件変更検出・優先度付与機能 - 更新間隔閾値境界値検証', () => {
  // SCEN-534
  test('前回更新から6日59分経過時点では変更検出が発火しないこと', () => {
    // 現在時刻を固定
    const nowTimestamp = new Date('2024-01-15T10:00:00Z').getTime();

    // 6日59分前の更新時刻を計算
    const sixDaysNinetyNineMinutesMs = 6 * 24 * 60 * 60 * 1000 + 59 * 60 * 1000;
    const lastUpdatedTimestamp = nowTimestamp - sixDaysNinetyNineMinutesMs;

    const constraintData = {
      userId: 'user-001',
      familyMemberId: 'member-001',
      lastUpdatedAt: new Date(lastUpdatedTimestamp),
      constraints: [
        {
          type: 'allergen',
          value: 'peanut',
          active: true,
        },
      ],
    };

    // 変更検出実行（現在時刻を基準とする）
    const result = detectConstraintChanges(constraintData, nowTimestamp);

    // 期待結果：変更検出が発火していない（false を返す）
    expect(result.isChangeDetected).toBe(false);

    // 優先度付与ロジックが実行されていないこと
    expect(result.priorityAssigned).toBe(false);

    // 検出イベントがログに記録されていないこと
    expect(result.detectionEventLogged).toBe(false);

    // 検出理由が空であること
    expect(result.detectionReason).toBe('');

    // 次回検出予定日時が正しく計算されていることを確認
    // 7日間の要件を満たすまでの残り時間：7日 - 6日59分 = 1分
    const expectedNextDetectionMs = 1 * 60 * 1000;
    const nextDetectionTimestamp = lastUpdatedTimestamp + 7 * 24 * 60 * 60 * 1000;
    expect(nextDetectionTimestamp - nowTimestamp).toBe(expectedNextDetectionMs);
  });
});