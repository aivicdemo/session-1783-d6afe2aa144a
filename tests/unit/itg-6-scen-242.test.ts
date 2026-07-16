import { defineExtractionRequirement } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント抽出機能', () => {
  // SCEN-242
  test('プロダクトマネージャーが改善レビュー会議結論から抽出要件を定義し、対象データ・集計期間・フィルタ条件・出力形式が正常に生成される', () => {
    const input = {
      pmUserId: 'pm_001',
      reviewConclusion: {
        targetDataTypes: ['userFeedback', 'usageLog'],
        aggregationStartDate: '2024-01-01',
        aggregationEndDate: '2024-01-31',
        filterConditions: {
          userSegment: 'specializedHusband',
          productFeatures: ['mealGeneration', 'cookingTimeOptimization', 'budgetTracking'],
          satisfactionScoreMin: 3.0,
          satisfactionScoreMax: 5.0,
        },
        outputFormat: 'JSON',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    const result = defineExtractionRequirement(input);

    expect(result).toEqual({
      extractionRequirementId: expect.any(String),
      pmUserId: 'pm_001',
      targetDataTypes: ['userFeedback', 'usageLog'],
      aggregationPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        durationDays: 31,
      },
      filterConditions: {
        userSegment: 'specializedHusband',
        productFeatures: ['mealGeneration', 'cookingTimeOptimization', 'budgetTracking'],
        satisfactionScoreRange: {
          min: 3.0,
          max: 5.0,
        },
      },
      outputFormat: 'JSON',
      specificationStatus: 'defined',
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
    });

    expect(result.targetDataTypes.length).toBe(2);
    expect(result.aggregationPeriod.durationDays).toBe(31);
    expect(result.filterConditions.productFeatures.length).toBe(3);
  });

  test('複数のユーザーセグメントと複雑なフィルタ条件で抽出要件が正常に生成される', () => {
    const input = {
      pmUserId: 'pm_002',
      reviewConclusion: {
        targetDataTypes: ['userFeedback', 'usageLog', 'actionHistory'],
        aggregationStartDate: '2024-02-01',
        aggregationEndDate: '2024-02-29',
        filterConditions: {
          userSegments: ['specializedHusband', 'busyParent', 'budgetConscious'],
          productFeatures: [
            'mealGeneration',
            'nutritionAnalysis',
            'budgetTracking',
            'allergyManagement',
          ],
          satisfactionScoreMin: 2.5,
          satisfactionScoreMax: 5.0,
          dropOffPoints: ['mealReviewScreen', 'constraintInputScreen'],
        },
        outputFormat: 'CSV',
      },
      createdAt: '2024-02-01T09:30:00Z',
    };

    const result = defineExtractionRequirement(input);

    expect(result.extractionRequirementId).toBeDefined();
    expect(result.targetDataTypes).toContain('userFeedback');
    expect(result.targetDataTypes).toContain('usageLog');
    expect(result.targetDataTypes).toContain('actionHistory');
    expect(result.aggregationPeriod.durationDays).toBe(29);
    expect(result.filterConditions.productFeatures.length).toBe(4);
    expect(result.outputFormat).toBe('CSV');
    expect(result.specificationStatus).toBe('defined');
  });

  test('単一のデータ型と最小フィルタ条件で抽出要件が生成される', () => {
    const input = {
      pmUserId: 'pm_003',
      reviewConclusion: {
        targetDataTypes: ['usageLog'],
        aggregationStartDate: '2024-03-15',
        aggregationEndDate: '2024-03-20',
        filterConditions: {
          userSegment: 'specializedHusband',
          satisfactionScoreMin: 1.0,
        },
        outputFormat: 'Excel',
      },
      createdAt: '2024-03-15T14:00:00Z',
    };

    const result = defineExtractionRequirement(input);

    expect(result.targetDataTypes.length).toBe(1);
    expect(result.targetDataTypes[0]).toBe('usageLog');
    expect(result.aggregationPeriod.durationDays).toBe(6);
    expect(result.filterConditions.userSegment).toBe('specializedHusband');
    expect(result.filterConditions.satisfactionScoreRange.min).toBe(1.0);
    expect(result.outputFormat).toBe('Excel');
  });

  test('無効なユーザーIDで呼び出された場合エラーが発生する', () => {
    const input = {
      pmUserId: '',
      reviewConclusion: {
        targetDataTypes: ['userFeedback'],
        aggregationStartDate: '2024-01-01',
        aggregationEndDate: '2024-01-31',
        filterConditions: {
          userSegment: 'specializedHusband',
        },
        outputFormat: 'JSON',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    expect(() => defineExtractionRequirement(input)).toThrow(/ユーザーID/);
  });

  test('無効な集計期間で呼び出された場合エラーが発生する', () => {
    const input = {
      pmUserId: 'pm_001',
      reviewConclusion: {
        targetDataTypes: ['userFeedback'],
        aggregationStartDate: '2024-01-31',
        aggregationEndDate: '2024-01-01',
        filterConditions: {
          userSegment: 'specializedHusband',
        },
        outputFormat: 'JSON',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    expect(() => defineExtractionRequirement(input)).toThrow(/集計期間/);
  });

  test('空のデータ型配列で呼び出された場合エラーが発生する', () => {
    const input = {
      pmUserId: 'pm_001',
      reviewConclusion: {
        targetDataTypes: [],
        aggregationStartDate: '2024-01-01',
        aggregationEndDate: '2024-01-31',
        filterConditions: {
          userSegment: 'specializedHusband',
        },
        outputFormat: 'JSON',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    expect(() => defineExtractionRequirement(input)).toThrow(/データ型/);
  });

  test('無効な出力形式で呼び出された場合エラーが発生する', () => {
    const input = {
      pmUserId: 'pm_001',
      reviewConclusion: {
        targetDataTypes: ['userFeedback'],
        aggregationStartDate: '2024-01-01',
        aggregationEndDate: '2024-01-31',
        filterConditions: {
          userSegment: 'specializedHusband',
        },
        outputFormat: 'InvalidFormat',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    expect(() => defineExtractionRequirement(input)).toThrow(/出力形式/);
  });

  test('複数の抽出要件が順序正しく生成され、各IDが一意である', () => {
    const input1 = {
      pmUserId: 'pm_001',
      reviewConclusion: {
        targetDataTypes: ['userFeedback'],
        aggregationStartDate: '2024-01-01',
        aggregationEndDate: '2024-01-31',
        filterConditions: { userSegment: 'specializedHusband' },
        outputFormat: 'JSON',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    const input2 = {
      pmUserId: 'pm_002',
      reviewConclusion: {
        targetDataTypes: ['usageLog'],
        aggregationStartDate: '2024-02-01',
        aggregationEndDate: '2024-02-28',
        filterConditions: { userSegment: 'busyParent' },
        outputFormat: 'CSV',
      },
      createdAt: '2024-02-01T09:30:00Z',
    };

    const result1 = defineExtractionRequirement(input1);
    const result2 = defineExtractionRequirement(input2);

    expect(result1.extractionRequirementId).not.toBe(result2.extractionRequirementId);
    expect(result1.pmUserId).toBe('pm_001');
    expect(result2.pmUserId).toBe('pm_002');
  });

  test('フィルタ条件の満足度スコア範囲が正常に計算される', () => {
    const input = {
      pmUserId: 'pm_001',
      reviewConclusion: {
        targetDataTypes: ['userFeedback', 'usageLog'],
        aggregationStartDate: '2024-01-01',
        aggregationEndDate: '2024-01-31',
        filterConditions: {
          userSegment: 'specializedHusband',
          satisfactionScoreMin: 2.0,
          satisfactionScoreMax: 4.5,
        },
        outputFormat: 'JSON',
      },
      createdAt: '2024-01-15T11:00:00Z',
    };

    const result = defineExtractionRequirement(input);

    expect(result.filterConditions.satisfactionScoreRange.min).toBe(2.0);
    expect(result.filterConditions.satisfactionScoreRange.max).toBe(4.5);
  });
});