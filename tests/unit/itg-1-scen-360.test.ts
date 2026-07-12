import { aggregateFamilyMealEvaluations } from '../../src/logic/it-2';

describe('家族成員の食事評価データ蓄積・管理機能', () => {
  // SCEN-360: [edge] 食事評価データ蓄積機能 - 同一献立・同一家族成員の重複評価データが蓄積される場合、タイムスタンプで区別される
  test('同一献立・同一家族成員による複数回の食事評価が全てタイムスタンプで区別されて蓄積される', () => {
    const mealId = 'meal_001';
    const familyMemberId = 'member_father_001';
    const userId = 'user_001';

    const timestamp1 = new Date('2024-01-15T18:30:00Z');
    const timestamp2 = new Date('2024-01-22T18:30:00Z');
    const timestamp3 = new Date('2024-01-29T18:30:00Z');

    const evaluation1 = {
      mealId,
      familyMemberId,
      userId,
      satisfactionScore: 5,
      comment: '塩焼きが香ばしくておいしかった',
      timestamp: timestamp1,
    };

    const evaluation2 = {
      mealId,
      familyMemberId,
      userId,
      satisfactionScore: 4,
      comment: '塩辛くなかったのが良かった',
      timestamp: timestamp2,
    };

    const evaluation3 = {
      mealId,
      familyMemberId,
      userId,
      satisfactionScore: 3,
      comment: 'ご飯が少し固かった',
      timestamp: timestamp3,
    };

    const evaluations = [evaluation1, evaluation2, evaluation3];

    const result = aggregateFamilyMealEvaluations({
      mealId,
      familyMemberId,
      userId,
      evaluations,
    });

    expect(result.totalEvaluationCount).toBe(3);
    expect(result.aggregatedEvaluations).toHaveLength(3);

    expect(result.aggregatedEvaluations[0]).toEqual({
      mealId,
      familyMemberId,
      userId,
      satisfactionScore: 5,
      comment: '塩焼きが香ばしくておいしかった',
      timestamp: timestamp1,
    });

    expect(result.aggregatedEvaluations[1]).toEqual({
      mealId,
      familyMemberId,
      userId,
      satisfactionScore: 4,
      comment: '塩辛くなかったのが良かった',
      timestamp: timestamp2,
    });

    expect(result.aggregatedEvaluations[2]).toEqual({
      mealId,
      familyMemberId,
      userId,
      satisfactionScore: 3,
      comment: 'ご飯が少し固かった',
      timestamp: timestamp3,
    });

    expect(result.timestampDistinct).toBe(true);
    expect(result.aggregatedEvaluations[0].timestamp).not.toEqual(
      result.aggregatedEvaluations[1].timestamp
    );
    expect(result.aggregatedEvaluations[1].timestamp).not.toEqual(
      result.aggregatedEvaluations[2].timestamp
    );
    expect(result.aggregatedEvaluations[0].timestamp).not.toEqual(
      result.aggregatedEvaluations[2].timestamp
    );

    expect(result.chronologicalOrder).toBe(true);
    const ts1 = result.aggregatedEvaluations[0].timestamp.getTime();
    const ts2 = result.aggregatedEvaluations[1].timestamp.getTime();
    const ts3 = result.aggregatedEvaluations[2].timestamp.getTime();
    expect(ts1 < ts2).toBe(true);
    expect(ts2 < ts3).toBe(true);
  });
});