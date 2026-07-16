import { generatePainPointAndDifferentiationList } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-376
  test('ユーザーインタビュー記録が空である場合、エラー状態で優先度リストが生成されない', () => {
    const input = {
      interviewRecords: [],
      usageLogData: [
        {
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          mealRestrictionsApplied: true,
          cookingTimeMinutes: 45,
          budgetConstraintJpy: 2000,
        },
      ],
      analysisStartDate: new Date('2024-01-01T00:00:00Z'),
      analysisEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    expect(() => generatePainPointAndDifferentiationList(input)).toThrow(
      /インタビュー記録/
    );
  });

  test('ユーザーインタビュー記録が存在し、利用ログデータが存在する場合、正常に優先度マトリクスを生成する', () => {
    const input = {
      interviewRecords: [
        {
          interviewId: 'interview-001',
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-10T09:00:00Z'),
          content:
            '毎日の献立作成に30分以上かかってしまう。家族の食物アレルギーが多く、毎回確認が必要',
          painCategories: ['調理時間', '食材制限'],
          priority: 1,
        },
        {
          interviewId: 'interview-002',
          userId: 'user-002',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-12T14:30:00Z'),
          content: '月の食費予算が3万円に制限されているので、安い食材を探すのに時間がかかる',
          painCategories: ['予算制約'],
          priority: 2,
        },
      ],
      usageLogData: [
        {
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          mealRestrictionsApplied: true,
          cookingTimeMinutes: 45,
          budgetConstraintJpy: 3000,
        },
        {
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-16T11:30:00Z'),
          mealRestrictionsApplied: true,
          cookingTimeMinutes: 38,
          budgetConstraintJpy: 2800,
        },
        {
          userId: 'user-002',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-17T09:15:00Z'),
          mealRestrictionsApplied: false,
          cookingTimeMinutes: 25,
          budgetConstraintJpy: 3000,
        },
      ],
      analysisStartDate: new Date('2024-01-01T00:00:00Z'),
      analysisEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const result = generatePainPointAndDifferentiationList(input);

    expect(result).toHaveProperty('painPointMatrix');
    expect(result).toHaveProperty('differentiationFeatureList');
    expect(result).toHaveProperty('analysisStatus');

    expect(result.analysisStatus).toBe('success');

    expect(result.painPointMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          painCategory: '調理時間',
          occurrenceFrequency: 2,
          impactScore: 75,
          priorityRank: expect.any(String),
        }),
        expect.objectContaining({
          painCategory: '食材制限',
          occurrenceFrequency: 2,
          impactScore: 65,
          priorityRank: expect.any(String),
        }),
        expect.objectContaining({
          painCategory: '予算制約',
          occurrenceFrequency: 1,
          impactScore: 50,
          priorityRank: expect.any(String),
        }),
      ])
    );

    expect(result.differentiationFeatureList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureId: expect.any(String),
          featureName: expect.any(String),
          targetPainCategory: expect.any(String),
          priorityScore: expect.any(Number),
          targetSegmentId: 'segment-stay-at-home-dad',
        }),
      ])
    );

    expect(result.painPointMatrix.length).toBeGreaterThan(0);
    expect(result.differentiationFeatureList.length).toBeGreaterThan(0);
  });

  test('ユーザーインタビュー記録が存在し、利用ログデータが空である場合、部分的にペイン要因マトリクスが生成される', () => {
    const input = {
      interviewRecords: [
        {
          interviewId: 'interview-001',
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-10T09:00:00Z'),
          content: '調理時間の短縮が大きな課題である',
          painCategories: ['調理時間'],
          priority: 1,
        },
      ],
      usageLogData: [],
      analysisStartDate: new Date('2024-01-01T00:00:00Z'),
      analysisEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const result = generatePainPointAndDifferentiationList(input);

    expect(result.analysisStatus).toBe('partial');
    expect(result.painPointMatrix).toBeDefined();
    expect(result.painPointMatrix.length).toBeGreaterThan(0);
    expect(result.painPointMatrix[0]).toHaveProperty('painCategory');
    expect(result.painPointMatrix[0]).toHaveProperty('occurrenceFrequency');
  });

  test('複数のペイン要因が存在する場合、優先度スコアが正確に計算される', () => {
    const input = {
      interviewRecords: [
        {
          interviewId: 'interview-001',
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-10T09:00:00Z'),
          content: '調理時間と食材制限の両方が大きな課題',
          painCategories: ['調理時間', '食材制限'],
          priority: 1,
        },
        {
          interviewId: 'interview-002',
          userId: 'user-002',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-12T14:30:00Z'),
          content: '調理時間を短縮したい',
          painCategories: ['調理時間'],
          priority: 2,
        },
        {
          interviewId: 'interview-003',
          userId: 'user-003',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-14T16:00:00Z'),
          content: '予算制約と食材制限が課題',
          painCategories: ['予算制約', '食材制限'],
          priority: 3,
        },
      ],
      usageLogData: [
        {
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          mealRestrictionsApplied: true,
          cookingTimeMinutes: 50,
          budgetConstraintJpy: 2500,
        },
        {
          userId: 'user-002',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-16T11:30:00Z'),
          mealRestrictionsApplied: false,
          cookingTimeMinutes: 40,
          budgetConstraintJpy: 3500,
        },
        {
          userId: 'user-003',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-17T09:15:00Z'),
          mealRestrictionsApplied: true,
          cookingTimeMinutes: 35,
          budgetConstraintJpy: 2800,
        },
      ],
      analysisStartDate: new Date('2024-01-01T00:00:00Z'),
      analysisEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const result = generatePainPointAndDifferentiationList(input);

    expect(result.analysisStatus).toBe('success');

    const cookingTimePain = result.painPointMatrix.find(
      (p) => p.painCategory === '調理時間'
    );
    expect(cookingTimePain).toBeDefined();
    expect(cookingTimePain?.occurrenceFrequency).toBe(2);

    const mealRestrictionPain = result.painPointMatrix.find(
      (p) => p.painCategory === '食材制限'
    );
    expect(mealRestrictionPain).toBeDefined();
    expect(mealRestrictionPain?.occurrenceFrequency).toBe(2);

    const budgetConstraintPain = result.painPointMatrix.find(
      (p) => p.painCategory === '予算制約'
    );
    expect(budgetConstraintPain).toBeDefined();
    expect(budgetConstraintPain?.occurrenceFrequency).toBe(1);

    expect(cookingTimePain!.impactScore).toBeGreaterThan(
      budgetConstraintPain!.impactScore
    );
  });

  test('異常値・外れ値を除外して分析が実行される', () => {
    const input = {
      interviewRecords: [
        {
          interviewId: 'interview-001',
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          recordedDate: new Date('2024-01-10T09:00:00Z'),
          content: '調理時間を短縮したい',
          painCategories: ['調理時間'],
          priority: 1,
        },
      ],
      usageLogData: [
        {
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          mealRestrictionsApplied: false,
          cookingTimeMinutes: 180,
          budgetConstraintJpy: 50000,
        },
        {
          userId: 'user-001',
          segmentId: 'segment-stay-at-home-dad',
          actionType: 'menu_generation',
          timestamp: new Date('2024-01-16T11:30:00Z'),
          mealRestrictionsApplied: false,
          cookingTimeMinutes: 35,
          budgetConstraintJpy: 2500,
        },
      ],
      analysisStartDate: new Date('2024-01-01T00:00:00Z'),
      analysisEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    const result = generatePainPointAndDifferentiationList(input);

    expect(result).toHaveProperty('dataQualityReport');
    expect(result.dataQualityReport).toHaveProperty('outlierDetected');
    expect(result.dataQualityReport.outlierDetected).toBe(true);
  });
});