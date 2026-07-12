import { calculateCookingTimeAchievementBySegment } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-685: 調理時間短縮実現度セグメント別比較機能
  test('各セグメントの目標調理時間と実績調理時間の差分が正確に計算され、達成度パーセンテージが表示される', () => {
    const segments = [
      {
        segmentId: 'breakfast',
        segmentName: '朝食',
        targetCookingTime: 30,
        actualCookingTime: 20,
      },
      {
        segmentId: 'lunch',
        segmentName: '昼食',
        targetCookingTime: 45,
        actualCookingTime: 35,
      },
      {
        segmentId: 'dinner',
        segmentName: '夕食',
        targetCookingTime: 60,
        actualCookingTime: 48,
      },
      {
        segmentId: 'snack',
        segmentName: 'おやつ',
        targetCookingTime: 15,
        actualCookingTime: 10,
      },
    ];

    const result = calculateCookingTimeAchievementBySegment(segments);

    // 成功系：全セグメントが正確に計算される
    expect(result).toHaveLength(4);

    // セグメント1（朝食）: 目標30分、実績20分、差分10分、達成度 (10/30)*100 = 33.3%
    expect(result[0]).toEqual({
      segmentId: 'breakfast',
      segmentName: '朝食',
      targetCookingTime: 30,
      actualCookingTime: 20,
      timeDifference: 10,
      achievementPercentage: 33.3,
    });

    // セグメント2（昼食）: 目標45分、実績35分、差分10分、達成度 (10/45)*100 = 22.2%
    expect(result[1]).toEqual({
      segmentId: 'lunch',
      segmentName: '昼食',
      targetCookingTime: 45,
      actualCookingTime: 35,
      timeDifference: 10,
      achievementPercentage: 22.2,
    });

    // セグメント3（夕食）: 目標60分、実績48分、差分12分、達成度 (12/60)*100 = 20.0%
    expect(result[2]).toEqual({
      segmentId: 'dinner',
      segmentName: '夕食',
      targetCookingTime: 60,
      actualCookingTime: 48,
      timeDifference: 12,
      achievementPercentage: 20.0,
    });

    // セグメント4（おやつ）: 目標15分、実績10分、差分5分、達成度 (5/15)*100 = 33.3%
    expect(result[3]).toEqual({
      segmentId: 'snack',
      segmentName: 'おやつ',
      targetCookingTime: 15,
      actualCookingTime: 10,
      timeDifference: 5,
      achievementPercentage: 33.3,
    });

    // 達成度パーセンテージが小数第1位まで正確
    result.forEach((segment) => {
      expect(segment.achievementPercentage).toBeLessThanOrEqual(100);
      expect(segment.achievementPercentage).toBeGreaterThanOrEqual(0);
      // 小数第1位までの精度を確認（第2位以降の値を確認）
      const decimalPart = segment.achievementPercentage.toString().split('.')[1];
      if (decimalPart) {
        expect(decimalPart.length).toBeLessThanOrEqual(1);
      }
    });

    // 複数セグメント間で達成度が正確に比較できる
    const sortedByAchievement = [...result].sort(
      (a, b) => b.achievementPercentage - a.achievementPercentage
    );
    expect(sortedByAchievement[0].achievementPercentage).toBe(33.3); // 朝食またはおやつ
    expect(sortedByAchievement[sortedByAchievement.length - 1].achievementPercentage).toBe(20.0); // 夕食

    // セグメント別の達成状況が明確に把握できる
    const achievementMap = new Map(
      result.map((seg) => [seg.segmentId, seg.achievementPercentage])
    );
    expect(achievementMap.get('breakfast')).toBe(33.3);
    expect(achievementMap.get('lunch')).toBe(22.2);
    expect(achievementMap.get('dinner')).toBe(20.0);
    expect(achievementMap.get('snack')).toBe(33.3);
  });

  // エラー系：目標調理時間が0の場合（ゼロ除算防止）
  test('目標調理時間が0の場合、エラーをスロー', () => {
    const invalidSegments = [
      {
        segmentId: 'invalid',
        segmentName: 'テスト',
        targetCookingTime: 0,
        actualCookingTime: 10,
      },
    ];

    expect(() => calculateCookingTimeAchievementBySegment(invalidSegments)).toThrow(/目標調理時間/);
  });

  // エラー系：実績調理時間が負の値の場合
  test('実績調理時間が負の値の場合、エラーをスロー', () => {
    const invalidSegments = [
      {
        segmentId: 'invalid',
        segmentName: 'テスト',
        targetCookingTime: 30,
        actualCookingTime: -5,
      },
    ];

    expect(() => calculateCookingTimeAchievementBySegment(invalidSegments)).toThrow(/実績調理時間/);
  });

  // エラー系：セグメント配列が空の場合
  test('セグメント配列が空の場合、エラーをスロー', () => {
    const emptySegments: any[] = [];

    expect(() => calculateCookingTimeAchievementBySegment(emptySegments)).toThrow(/セグメント/);
  });

  // 境界値：実績が目標を上回る場合（負の差分になる場合）
  test('実績調理時間が目標を上回る場合、達成度が負の値になる', () => {
    const segments = [
      {
        segmentId: 'overtime',
        segmentName: 'テスト',
        targetCookingTime: 30,
        actualCookingTime: 40,
      },
    ];

    const result = calculateCookingTimeAchievementBySegment(segments);

    // 差分が負になる（目標を超過）
    expect(result[0].timeDifference).toBe(-10);
    // 達成度が負になる (-10/30)*100 = -33.3%
    expect(result[0].achievementPercentage).toBe(-33.3);
  });

  // 境界値：実績が目標と一致する場合
  test('実績調理時間が目標と一致する場合、達成度が0.0%になる', () => {
    const segments = [
      {
        segmentId: 'exact',
        segmentName: 'テスト',
        targetCookingTime: 30,
        actualCookingTime: 30,
      },
    ];

    const result = calculateCookingTimeAchievementBySegment(segments);

    expect(result[0].timeDifference).toBe(0);
    expect(result[0].achievementPercentage).toBe(0.0);
  });
});