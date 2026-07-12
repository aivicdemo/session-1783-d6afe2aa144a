import { accumulateFoodEvaluationData } from '../../src/logic/it-2';

describe('家族成員の食事評価データ蓄積・管理機能', () => {
  // SCEN-357
  test('食事評価データが時系列で正確に蓄積される', () => {
    const userId = 'user_001';
    const familyMemberId_A = 'member_001';
    const familyMemberId_B = 'member_002';

    const timestamp_1 = new Date('2024-01-15T07:30:00Z').toISOString();
    const timestamp_2 = new Date('2024-01-15T12:00:00Z').toISOString();
    const timestamp_3 = new Date('2024-01-15T18:45:00Z').toISOString();

    const evaluation_1 = {
      userId,
      familyMemberId: familyMemberId_A,
      mealType: 'breakfast',
      satisfactionScore: 5,
      completionRate: 4,
      requestText: 'もっと塩辛くしてほしい',
      recordedAt: timestamp_1,
    };

    const evaluation_2 = {
      userId,
      familyMemberId: familyMemberId_B,
      mealType: 'lunch',
      satisfactionScore: 3,
      completionRate: 5,
      requestText: '野菜をもっと多くしてください',
      recordedAt: timestamp_2,
    };

    const evaluation_3 = {
      userId,
      familyMemberId: familyMemberId_A,
      mealType: 'dinner',
      satisfactionScore: 4,
      completionRate: 4,
      requestText: 'デザートがほしい',
      recordedAt: timestamp_3,
    };

    const input = {
      userId,
      evaluations: [evaluation_1, evaluation_2, evaluation_3],
    };

    const result = accumulateFoodEvaluationData(input);

    expect(result.status).toBe('success');
    expect(result.accumulatedCount).toBe(3);
    expect(result.data).toHaveLength(3);

    expect(result.data[0].familyMemberId).toBe(familyMemberId_A);
    expect(result.data[0].satisfactionScore).toBe(5);
    expect(result.data[0].completionRate).toBe(4);
    expect(result.data[0].requestText).toBe('もっと塩辛くしてほしい');
    expect(result.data[0].recordedAt).toBe(timestamp_1);
    expect(result.data[0].mealType).toBe('breakfast');

    expect(result.data[1].familyMemberId).toBe(familyMemberId_B);
    expect(result.data[1].satisfactionScore).toBe(3);
    expect(result.data[1].completionRate).toBe(5);
    expect(result.data[1].requestText).toBe('野菜をもっと多くしてください');
    expect(result.data[1].recordedAt).toBe(timestamp_2);
    expect(result.data[1].mealType).toBe('lunch');

    expect(result.data[2].familyMemberId).toBe(familyMemberId_A);
    expect(result.data[2].satisfactionScore).toBe(4);
    expect(result.data[2].completionRate).toBe(4);
    expect(result.data[2].requestText).toBe('デザートがほしい');
    expect(result.data[2].recordedAt).toBe(timestamp_3);
    expect(result.data[2].mealType).toBe('dinner');

    const familyMember_A_Records = result.data.filter(
      (record) => record.familyMemberId === familyMemberId_A
    );
    expect(familyMember_A_Records).toHaveLength(2);
    expect(familyMember_A_Records[0].recordedAt).toBe(timestamp_1);
    expect(familyMember_A_Records[1].recordedAt).toBe(timestamp_3);
    expect(
      new Date(familyMember_A_Records[0].recordedAt).getTime() <
        new Date(familyMember_A_Records[1].recordedAt).getTime()
    ).toBe(true);

    expect(result.chronologicalOrder).toBe(true);
    expect(result.timestampValidation).toBe(true);
  });
});