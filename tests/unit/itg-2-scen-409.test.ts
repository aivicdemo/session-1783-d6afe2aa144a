import { calculateConflictPatternImportanceScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-409
  test('[error] 抵触パターン重要度スコア自動算出機能 - 抵触パターンデータが不完全または無効な場合、デフォルト値で処理されるか例外が発生する', () => {
    // === Case 1: 必須フィールドが完全で正常なデータ（ハッピーパス）===
    const validConflictPattern = {
      patternId: 'pattern_001',
      restrictionType: 'allergen',
      affectedMealCount: 5,
      severityLevel: 3,
      userSegmentImpact: 2,
      detectedDate: '2024-01-15T10:00:00Z',
    };

    const validResult = calculateConflictPatternImportanceScore(validConflictPattern);
    // formula: importance_score = (severityLevel * 3) + (userSegmentImpact * 2) + (affectedMealCount * 0.5)
    // = (3 * 3) + (2 * 2) + (5 * 0.5) = 9 + 4 + 2.5 = 15.5
    expect(validResult).toEqual({
      patternId: 'pattern_001',
      importanceScore: 15.5,
      riskLevel: 'high',
      processedAt: '2024-01-15T10:00:00Z',
      appliedDefaults: [],
    });

    // === Case 2: affectedMealCount が欠落（デフォルト値適用）===
    const missingAffectedMealCount = {
      patternId: 'pattern_002',
      restrictionType: 'dietary',
      severityLevel: 2,
      userSegmentImpact: 1,
      detectedDate: '2024-01-15T10:30:00Z',
    };

    const resultWithMissingMealCount = calculateConflictPatternImportanceScore(missingAffectedMealCount);
    // affectedMealCount デフォルト値: 0
    // formula: (2 * 3) + (1 * 2) + (0 * 0.5) = 6 + 2 + 0 = 8
    expect(resultWithMissingMealCount).toEqual({
      patternId: 'pattern_002',
      importanceScore: 8,
      riskLevel: 'medium',
      processedAt: '2024-01-15T10:30:00Z',
      appliedDefaults: ['affectedMealCount'],
    });

    // === Case 3: severityLevel が無効な値（負数）===
    const invalidSeverityLevel = {
      patternId: 'pattern_003',
      restrictionType: 'allergen',
      affectedMealCount: 3,
      severityLevel: -1,
      userSegmentImpact: 1,
      detectedDate: '2024-01-15T11:00:00Z',
    };

    expect(() => calculateConflictPatternImportanceScore(invalidSeverityLevel))
      .toThrow(/severity|スコア|重要度/);

    // === Case 4: userSegmentImpact が欠落（デフォルト値適用）===
    const missingUserSegmentImpact = {
      patternId: 'pattern_004',
      restrictionType: 'dietary',
      affectedMealCount: 2,
      severityLevel: 2,
      detectedDate: '2024-01-15T11:30:00Z',
    };

    const resultWithMissingSegmentImpact = calculateConflictPatternImportanceScore(missingUserSegmentImpact);
    // userSegmentImpact デフォルト値: 0
    // formula: (2 * 3) + (0 * 2) + (2 * 0.5) = 6 + 0 + 1 = 7
    expect(resultWithMissingSegmentImpact).toEqual({
      patternId: 'pattern_004',
      importanceScore: 7,
      riskLevel: 'low',
      processedAt: '2024-01-15T11:30:00Z',
      appliedDefaults: ['userSegmentImpact'],
    });

    // === Case 5: patternId が空文字列（必須フィールド欠落）===
    const emptyPatternId = {
      patternId: '',
      restrictionType: 'allergen',
      affectedMealCount: 4,
      severityLevel: 3,
      userSegmentImpact: 2,
      detectedDate: '2024-01-15T12:00:00Z',
    };

    expect(() => calculateConflictPatternImportanceScore(emptyPatternId))
      .toThrow(/patternId|識別子|ID/);

    // === Case 6: restrictionType が無効な値===
    const invalidRestrictionType = {
      patternId: 'pattern_005',
      restrictionType: 'invalid_type',
      affectedMealCount: 3,
      severityLevel: 2,
      userSegmentImpact: 1,
      detectedDate: '2024-01-15T12:30:00Z',
    };

    expect(() => calculateConflictPatternImportanceScore(invalidRestrictionType))
      .toThrow(/restrictionType|制限タイプ|種別/);

    // === Case 7: detectedDate が不正な日付形式===
    const invalidDate = {
      patternId: 'pattern_006',
      restrictionType: 'allergen',
      affectedMealCount: 2,
      severityLevel: 1,
      userSegmentImpact: 1,
      detectedDate: 'invalid-date-string',
    };

    expect(() => calculateConflictPatternImportanceScore(invalidDate))
      .toThrow(/date|日付|形式/);

    // === Case 8: すべての欠落値（複数デフォルト値適用）===
    const minimalData = {
      patternId: 'pattern_007',
      restrictionType: 'dietary',
      detectedDate: '2024-01-15T13:00:00Z',
    };

    const resultWithMultipleDefaults = calculateConflictPatternImportanceScore(minimalData);
    // affectedMealCount: 0, severityLevel: 1 (default), userSegmentImpact: 0
    // formula: (1 * 3) + (0 * 2) + (0 * 0.5) = 3 + 0 + 0 = 3
    expect(resultWithMultipleDefaults).toEqual({
      patternId: 'pattern_007',
      importanceScore: 3,
      riskLevel: 'low',
      processedAt: '2024-01-15T13:00:00Z',
      appliedDefaults: ['severityLevel', 'affectedMealCount', 'userSegmentImpact'],
    });

    // === Case 9: affectedMealCount = 0（エッジケース）===
    const zeroMealCount = {
      patternId: 'pattern_008',
      restrictionType: 'allergen',
      affectedMealCount: 0,
      severityLevel: 2,
      userSegmentImpact: 1,
      detectedDate: '2024-01-15T13:30:00Z',
    };

    const resultZeroMealCount = calculateConflictPatternImportanceScore(zeroMealCount);
    // formula: (2 * 3) + (1 * 2) + (0 * 0.5) = 6 + 2 + 0 = 8
    expect(resultZeroMealCount).toEqual({
      patternId: 'pattern_008',
      importanceScore: 8,
      riskLevel: 'medium',
      processedAt: '2024-01-15T13:30:00Z',
      appliedDefaults: [],
    });

    // === Case 10: 高重要度スコア（risk level が high）===
    const highImportanceData = {
      patternId: 'pattern_009',
      restrictionType: 'allergen',
      affectedMealCount: 10,
      severityLevel: 5,
      userSegmentImpact: 5,
      detectedDate: '2024-01-15T14:00:00Z',
    };

    const resultHighImportance = calculateConflictPatternImportanceScore(highImportanceData);
    // formula: (5 * 3) + (5 * 2) + (10 * 0.5) = 15 + 10 + 5 = 30
    expect(resultHighImportance).toEqual({
      patternId: 'pattern_009',
      importanceScore: 30,
      riskLevel: 'high',
      processedAt: '2024-01-15T14:00:00Z',
      appliedDefaults: [],
    });

    // === Case 11: 低重要度スコア（risk level が low）===
    const lowImportanceData = {
      patternId: 'pattern_010',
      restrictionType: 'dietary',
      affectedMealCount: 1,
      severityLevel: 1,
      userSegmentImpact: 0,
      detectedDate: '2024-01-15T14:30:00Z',
    };

    const resultLowImportance = calculateConflictPatternImportanceScore(lowImportanceData);
    // formula: (1 * 3) + (0 * 2) + (1 * 0.5) = 3 + 0 + 0.5 = 3.5
    expect(resultLowImportance).toEqual({
      patternId: 'pattern_010',
      importanceScore: 3.5,
      riskLevel: 'low',
      processedAt: '2024-01-15T14:30:00Z',
      appliedDefaults: [],
    });
  });
});