import { classifyAndDetectAnomalies } from '../../src/logic/it-8-1-2-1';

describe('SCEN-292: 却下理由自動分類機能 - 異常値・重複・不完全データ検出', () => {
  test('SCEN-292: 異常値・重複・不完全データが正しく検出・フラグ付けされる', () => {
    // テストデータ準備: 異常値を含むデータセット
    const anomalousDataset = [
      {
        userId: 'user_001',
        reasonText: 'nutritionImbalance',
        timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
        category: 'nutrition',
        severity: 1,
      },
      {
        userId: 'user_001',
        reasonText: null, // 異常値: null
        timestamp: new Date('2024-01-15T10:35:00Z').toISOString(),
        category: 'nutrition',
        severity: 1,
      },
      {
        userId: 'user_002',
        reasonText: 'cookingTimeExceeded',
        timestamp: new Date('2024-01-15T10:40:00Z').toISOString(),
        category: undefined, // 異常値: undefined
        severity: 1,
      },
      {
        userId: 'user_003',
        reasonText: 'familyPreferenceNotReflected',
        timestamp: new Date('2024-01-15T10:45:00Z').toISOString(),
        category: 'preference',
        severity: 999, // 異常値: 極端な数値
      },
    ];

    // テストデータ準備: 重複レコードを含むデータセット
    const duplicateDataset = [
      {
        userId: 'user_004',
        reasonText: 'foodRestrictionOmitted',
        timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
        category: 'restriction',
        severity: 2,
      },
      {
        userId: 'user_004',
        reasonText: 'foodRestrictionOmitted', // 重複: 同一内容
        timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
        category: 'restriction',
        severity: 2,
      },
      {
        userId: 'user_005',
        reasonText: 'budgetConstraintExceeded',
        timestamp: new Date('2024-01-15T11:05:00Z').toISOString(),
        category: 'budget',
        severity: 1,
      },
    ];

    // テストデータ準備: 不完全なデータセット
    const incompleteDataset = [
      {
        userId: 'user_006',
        reasonText: 'nutritionImbalance',
        timestamp: new Date('2024-01-15T11:10:00Z').toISOString(),
        category: 'nutrition',
        severity: 1,
      },
      {
        userId: 'user_007',
        // 不完全: reasonText フィールド欠落
        timestamp: new Date('2024-01-15T11:15:00Z').toISOString(),
        category: 'nutrition',
        severity: 1,
      },
      {
        userId: 'user_008',
        reasonText: 'cookingTimeExceeded',
        timestamp: 'invalid-timestamp-format', // 不完全: タイムスタンプ形式不正
        category: 'timing',
        severity: 1,
      },
    ];

    // 異常値検出テスト
    const anomalousResult = classifyAndDetectAnomalies(anomalousDataset);

    // 異常値フラグが付与されたことを確認
    expect(anomalousResult.flaggedRecords.length).toBe(3); // null, undefined, 極端な数値
    expect(anomalousResult.flaggedRecords[0]).toEqual({
      recordIndex: 1,
      userId: 'user_001',
      flagType: 'anomalousValue',
      detail: 'reasonText is null',
      severity: 'high',
      isExcludedFromAnalysis: true,
    });
    expect(anomalousResult.flaggedRecords[1]).toEqual({
      recordIndex: 2,
      userId: 'user_002',
      flagType: 'anomalousValue',
      detail: 'category is undefined',
      severity: 'high',
      isExcludedFromAnalysis: true,
    });
    expect(anomalousResult.flaggedRecords[2]).toEqual({
      recordIndex: 3,
      userId: 'user_003',
      flagType: 'anomalousValue',
      detail: 'severity exceeds normal range (999 > 10)',
      severity: 'medium',
      isExcludedFromAnalysis: true,
    });

    // 重複検出テスト
    const duplicateResult = classifyAndDetectAnomalies(duplicateDataset);

    // 重複フラグが付与されたことを確認
    expect(duplicateResult.flaggedRecords.length).toBe(1); // 重複 1 件
    expect(duplicateResult.flaggedRecords[0]).toEqual({
      recordIndex: 1,
      userId: 'user_004',
      flagType: 'duplicate',
      detail: 'Identical record at index 0 (userId, reasonText, timestamp, category, severity all match)',
      severity: 'medium',
      isExcludedFromAnalysis: true,
    });

    // 不完全なデータ検出テスト
    const incompleteResult = classifyAndDetectAnomalies(incompleteDataset);

    // 不完全データフラグが付与されたことを確認
    expect(incompleteResult.flaggedRecords.length).toBe(2); // 欠落フィールド、形式不正
    expect(incompleteResult.flaggedRecords[0]).toEqual({
      recordIndex: 1,
      userId: 'user_007',
      flagType: 'incompleteData',
      detail: 'Missing required field: reasonText',
      severity: 'high',
      isExcludedFromAnalysis: true,
    });
    expect(incompleteResult.flaggedRecords[1]).toEqual({
      recordIndex: 2,
      userId: 'user_008',
      flagType: 'incompleteData',
      detail: 'Invalid timestamp format: invalid-timestamp-format',
      severity: 'high',
      isExcludedFromAnalysis: true,
    });

    // フラグ付きデータが除外されていることを確認
    const anomalousClean = anomalousResult.cleanRecords;
    expect(anomalousClean.length).toBe(1); // フラグなし 1 件のみ残存
    expect(anomalousClean[0].userId).toBe('user_001');
    expect(anomalousClean[0].reasonText).toBe('nutritionImbalance');

    const duplicateClean = duplicateResult.cleanRecords;
    expect(duplicateClean.length).toBe(2); // 重複排除後 2 件
    expect(duplicateClean[0].userId).toBe('user_004');
    expect(duplicateClean[1].userId).toBe('user_005');

    const incompleteClean = incompleteResult.cleanRecords;
    expect(incompleteClean.length).toBe(1); // 不完全データ除外後 1 件
    expect(incompleteClean[0].userId).toBe('user_006');

    // 分類結果が正しいことを確認
    expect(anomalousResult.classificationSummary).toEqual({
      totalRecords: 4,
      flaggedCount: 3,
      cleanCount: 1,
      categoryCounts: {
        nutrition: 1,
        preference: 0,
        restriction: 0,
        timing: 0,
        budget: 0,
      },
      flagTypeCounts: {
        anomalousValue: 3,
        duplicate: 0,
        incompleteData: 0,
      },
    });

    expect(duplicateResult.classificationSummary).toEqual({
      totalRecords: 3,
      flaggedCount: 1,
      cleanCount: 2,
      categoryCounts: {
        nutrition: 0,
        preference: 0,
        restriction: 1,
        timing: 0,
        budget: 1,
      },
      flagTypeCounts: {
        anomalousValue: 0,
        duplicate: 1,
        incompleteData: 0,
      },
    });

    expect(incompleteResult.classificationSummary).toEqual({
      totalRecords: 3,
      flaggedCount: 2,
      cleanCount: 1,
      categoryCounts: {
        nutrition: 1,
        preference: 0,
        restriction: 0,
        timing: 0,
        budget: 0,
      },
      flagTypeCounts: {
        anomalousValue: 0,
        duplicate: 0,
        incompleteData: 2,
      },
    });

    // 後続処理での整合性確認
    expect(anomalousResult.dataIntegrity).toEqual({
      isConsistent: true,
      excludedRecordsCount: 3,
      usableRecordsCount: 1,
      qualityScore: 0.25, // 1 clean / 4 total
    });

    expect(duplicateResult.dataIntegrity).toEqual({
      isConsistent: true,
      excludedRecordsCount: 1,
      usableRecordsCount: 2,
      qualityScore: 0.67, // 2 clean / 3 total (rounded)
    });

    expect(incompleteResult.dataIntegrity).toEqual({
      isConsistent: true,
      excludedRecordsCount: 2,
      usableRecordsCount: 1,
      qualityScore: 0.33, // 1 clean / 3 total (rounded)
    });
  });
});