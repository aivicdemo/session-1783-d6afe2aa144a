import { extractSegmentedUsagePatterns } from '../../src/logic/it-1-br-8-2-2-1';

describe('セグメント別利用パターンデータ抽出・集計機能', () => {
  // SCEN-362
  test('集計期間の開始日と終了日が同一日のとき、単一日のデータが正確に抽出される', () => {
    const targetDate = '2024-01-15';
    const startDate = '2024-01-15';
    const endDate = '2024-01-15';

    const inputData = [
      {
        userId: 'user_001',
        segmentName: 'segment_young_single',
        date: '2024-01-14',
        mealGenerationSuccessCount: 2,
        cookingTimeMinutes: 25,
        userSatisfactionScore: 85,
      },
      {
        userId: 'user_002',
        segmentName: 'segment_young_single',
        date: '2024-01-15',
        mealGenerationSuccessCount: 3,
        cookingTimeMinutes: 20,
        userSatisfactionScore: 90,
      },
      {
        userId: 'user_003',
        segmentName: 'segment_young_single',
        date: '2024-01-15',
        mealGenerationSuccessCount: 2,
        cookingTimeMinutes: 22,
        userSatisfactionScore: 88,
      },
      {
        userId: 'user_004',
        segmentName: 'segment_family_with_kids',
        date: '2024-01-15',
        mealGenerationSuccessCount: 4,
        cookingTimeMinutes: 35,
        userSatisfactionScore: 82,
      },
      {
        userId: 'user_005',
        segmentName: 'segment_family_with_kids',
        date: '2024-01-15',
        mealGenerationSuccessCount: 3,
        cookingTimeMinutes: 40,
        userSatisfactionScore: 80,
      },
      {
        userId: 'user_006',
        segmentName: 'segment_young_single',
        date: '2024-01-16',
        mealGenerationSuccessCount: 2,
        cookingTimeMinutes: 21,
        userSatisfactionScore: 89,
      },
    ];

    const result = extractSegmentedUsagePatterns(inputData, startDate, endDate);

    expect(result.totalRecordCount).toBe(4);
    expect(result.records).toHaveLength(4);

    const allRecordsOnTargetDate = result.records.every(
      (record) => record.date === targetDate
    );
    expect(allRecordsOnTargetDate).toBe(true);

    const segmentYoungSingleRecords = result.records.filter(
      (record) => record.segmentName === 'segment_young_single'
    );
    const segmentFamilyWithKidsRecords = result.records.filter(
      (record) => record.segmentName === 'segment_family_with_kids'
    );

    expect(segmentYoungSingleRecords).toHaveLength(2);
    expect(segmentFamilyWithKidsRecords).toHaveLength(2);

    const youngSingleAggregated = result.segments.find(
      (seg) => seg.segmentName === 'segment_young_single'
    );
    expect(youngSingleAggregated?.totalMealGenerationSuccessCount).toBe(5);
    expect(youngSingleAggregated?.averageCookingTimeMinutes).toBeCloseTo(21, 1);
    expect(youngSingleAggregated?.averageUserSatisfactionScore).toBeCloseTo(89, 1);

    const familyWithKidsAggregated = result.segments.find(
      (seg) => seg.segmentName === 'segment_family_with_kids'
    );
    expect(familyWithKidsAggregated?.totalMealGenerationSuccessCount).toBe(7);
    expect(familyWithKidsAggregated?.averageCookingTimeMinutes).toBeCloseTo(37.5, 1);
    expect(familyWithKidsAggregated?.averageUserSatisfactionScore).toBeCloseTo(81, 1);

    const uniqueUserIds = new Set(result.records.map((r) => r.userId));
    expect(uniqueUserIds.size).toBe(4);

    const hasDuplicateRecords =
      result.records.length !==
      new Set(result.records.map((r) => `${r.userId}_${r.date}`)).size;
    expect(hasDuplicateRecords).toBe(false);

    const hasDataBeforeStartDate = result.records.some(
      (record) => record.date < startDate
    );
    const hasDataAfterEndDate = result.records.some(
      (record) => record.date > endDate
    );
    expect(hasDataBeforeStartDate).toBe(false);
    expect(hasDataAfterEndDate).toBe(false);
  });
});