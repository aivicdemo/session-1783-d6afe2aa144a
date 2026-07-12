import { analyzeSegmentationPatterns } from '../../src/logic/it-2';

describe('Family Member Meal Evaluation Data Accumulation & Management', () => {
  // SCEN-694
  test('should return error when segmentation analysis data has missing required fields', async () => {
    const incompleteDataSet = {
      segments: [
        {
          userId: 'user-001',
          segmentId: 'seg-A',
          // Missing: utilizationFrequency
          ageGroup: '30-40',
          familySize: 4,
          dietaryRestrictionFlag: true,
        },
        {
          // Missing: userId
          segmentId: 'seg-B',
          utilizationFrequency: 8.5,
          ageGroup: '40-50',
          familySize: 3,
          dietaryRestrictionFlag: false,
        },
        {
          userId: 'user-003',
          // Missing: segmentId
          utilizationFrequency: 12.3,
          ageGroup: '20-30',
          familySize: 2,
          dietaryRestrictionFlag: true,
        },
      ],
    };

    expect(() =>
      analyzeSegmentationPatterns(incompleteDataSet)
    ).toThrow(/必須項目/);
  });

  test('should return error when analysis data is completely empty', async () => {
    const emptyDataSet = {
      segments: [],
    };

    expect(() =>
      analyzeSegmentationPatterns(emptyDataSet)
    ).toThrow(/データが不完全/);
  });

  test('should return error when all required fields are null', async () => {
    const nullFieldsDataSet = {
      segments: [
        {
          userId: null,
          segmentId: null,
          utilizationFrequency: null,
          ageGroup: '30-40',
          familySize: 4,
          dietaryRestrictionFlag: true,
        },
      ],
    };

    expect(() =>
      analyzeSegmentationPatterns(nullFieldsDataSet)
    ).toThrow(/必須項目/);
  });

  test('should successfully analyze complete and valid segmentation data', async () => {
    const completeDataSet = {
      segments: [
        {
          userId: 'user-001',
          segmentId: 'seg-A',
          utilizationFrequency: 9.5,
          ageGroup: '30-40',
          familySize: 4,
          dietaryRestrictionFlag: true,
          generationSuccessRate: 87.5,
          cookingTimeReductionDegree: 22.3,
          userSatisfactionScore: 4.2,
        },
        {
          userId: 'user-002',
          segmentId: 'seg-B',
          utilizationFrequency: 12.0,
          ageGroup: '40-50',
          familySize: 3,
          dietaryRestrictionFlag: false,
          generationSuccessRate: 92.1,
          cookingTimeReductionDegree: 18.5,
          userSatisfactionScore: 4.6,
        },
        {
          userId: 'user-003',
          segmentId: 'seg-A',
          utilizationFrequency: 7.2,
          ageGroup: '30-40',
          familySize: 2,
          dietaryRestrictionFlag: true,
          generationSuccessRate: 81.3,
          cookingTimeReductionDegree: 25.1,
          userSatisfactionScore: 3.9,
        },
      ],
    };

    const result = analyzeSegmentationPatterns(completeDataSet);

    expect(result).toHaveProperty('analysisId');
    expect(result).toHaveProperty('status');
    expect(result.status).toBe('completed');
    expect(result).toHaveProperty('segmentSummaries');
    expect(Array.isArray(result.segmentSummaries)).toBe(true);
    expect(result.segmentSummaries.length).toBe(2);

    const segAData = result.segmentSummaries.find(
      (s: { segmentId: string }) => s.segmentId === 'seg-A'
    );
    expect(segAData).toBeDefined();
    expect(segAData.averageUtilizationFrequency).toBeCloseTo(8.35, 1);
    expect(segAData.averageGenerationSuccessRate).toBeCloseTo(84.4, 1);
    expect(segAData.averageUserSatisfactionScore).toBeCloseTo(4.05, 1);

    const segBData = result.segmentSummaries.find(
      (s: { segmentId: string }) => s.segmentId === 'seg-B'
    );
    expect(segBData).toBeDefined();
    expect(segBData.averageUtilizationFrequency).toBe(12.0);
    expect(segBData.averageGenerationSuccessRate).toBe(92.1);
    expect(segBData.averageUserSatisfactionScore).toBe(4.6);
  });

  test('should identify maximum differentiation effect segment correctly', async () => {
    const dataSetForDifferentiation = {
      segments: [
        {
          userId: 'user-010',
          segmentId: 'seg-high-impact',
          utilizationFrequency: 15.0,
          ageGroup: '25-35',
          familySize: 2,
          dietaryRestrictionFlag: false,
          generationSuccessRate: 94.5,
          cookingTimeReductionDegree: 32.8,
          userSatisfactionScore: 4.8,
        },
        {
          userId: 'user-011',
          segmentId: 'seg-medium-impact',
          utilizationFrequency: 6.5,
          ageGroup: '50-60',
          familySize: 5,
          dietaryRestrictionFlag: true,
          generationSuccessRate: 68.2,
          cookingTimeReductionDegree: 8.1,
          userSatisfactionScore: 3.2,
        },
      ],
    };

    const result = analyzeSegmentationPatterns(dataSetForDifferentiation);

    expect(result).toHaveProperty('maxDifferentiationSegment');
    expect(result.maxDifferentiationSegment).toEqual({
      segmentId: 'seg-high-impact',
      differentiationScore: 94.5,
      impactRank: 1,
    });
  });
});