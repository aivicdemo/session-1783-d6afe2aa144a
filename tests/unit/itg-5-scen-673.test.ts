import { classifyMealFeedbackReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-673
  test('既知カテゴリに該当しない理由テキストが入力された場合、未分類として正確に処理される', () => {
    const unknownReasonText = 'システムの仕様変更に伴う対応が必要';
    
    const result = classifyMealFeedbackReason({
      reasonText: unknownReasonText,
      userId: 'user-001',
      mealPlanId: 'plan-20240115-001',
      timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
    });

    expect(result).toEqual({
      reasonText: unknownReasonText,
      classifiedCategory: '未分類',
      confidence: 0,
      isKnownCategory: false,
      systemErrorOccurred: false,
      errorMessage: null,
    });

    expect(result.classifiedCategory).toBe('未分類');
    expect(result.isKnownCategory).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.systemErrorOccurred).toBe(false);
    expect(result.errorMessage).toBeNull();
  });

  test('既知カテゴリに該当する理由テキストが入力された場合、正確にカテゴリ分類される', () => {
    const knownReasonText = '調理時間が想定より長すぎた';
    
    const result = classifyMealFeedbackReason({
      reasonText: knownReasonText,
      userId: 'user-002',
      mealPlanId: 'plan-20240115-002',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });

    expect(result.isKnownCategory).toBe(true);
    expect(result.classifiedCategory).toBe('調理時間');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(result.systemErrorOccurred).toBe(false);
    expect(result.errorMessage).toBeNull();
  });

  test('複数の既知カテゴリに該当する可能性がある理由テキストの場合、最も高い信頼度のカテゴリが選択される', () => {
    const ambiguousReasonText = '栄養バランスが悪く、予算オーバーだった';
    
    const result = classifyMealFeedbackReason({
      reasonText: ambiguousReasonText,
      userId: 'user-003',
      mealPlanId: 'plan-20240115-003',
      timestamp: new Date('2024-01-15T12:00:00Z').toISOString(),
    });

    expect(result.isKnownCategory).toBe(true);
    expect(['栄養', '予算']).toContain(result.classifiedCategory);
    expect(result.confidence).toBeGreaterThan(50);
    expect(result.systemErrorOccurred).toBe(false);
    expect(result.errorMessage).toBeNull();
  });

  test('空文字列が入力された場合、未分類として処理される', () => {
    const emptyReasonText = '';
    
    const result = classifyMealFeedbackReason({
      reasonText: emptyReasonText,
      userId: 'user-004',
      mealPlanId: 'plan-20240115-004',
      timestamp: new Date('2024-01-15T13:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('未分類');
    expect(result.isKnownCategory).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリ一覧: 栄養バランス不適切', () => {
    const nutritionReasonText = 'たんぱく質が不足している';
    
    const result = classifyMealFeedbackReason({
      reasonText: nutritionReasonText,
      userId: 'user-005',
      mealPlanId: 'plan-20240115-005',
      timestamp: new Date('2024-01-15T14:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('栄養');
    expect(result.isKnownCategory).toBe(true);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリ一覧: 家族好み未反映', () => {
    const preferenceReasonText = '子どもが嫌いな野菜が入っている';
    
    const result = classifyMealFeedbackReason({
      reasonText: preferenceReasonText,
      userId: 'user-006',
      mealPlanId: 'plan-20240115-006',
      timestamp: new Date('2024-01-15T15:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('好み');
    expect(result.isKnownCategory).toBe(true);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリ一覧: 調理時間超過', () => {
    const cookingTimeReasonText = 'この献立は調理に3時間必要で時間制限に合わない';
    
    const result = classifyMealFeedbackReason({
      reasonText: cookingTimeReasonText,
      userId: 'user-007',
      mealPlanId: 'plan-20240115-007',
      timestamp: new Date('2024-01-15T16:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('調理時間');
    expect(result.isKnownCategory).toBe(true);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリ一覧: 食材制限漏れ', () => {
    const allergyReasonText = 'アレルギー食材が含まれていた';
    
    const result = classifyMealFeedbackReason({
      reasonText: allergyReasonText,
      userId: 'user-008',
      mealPlanId: 'plan-20240115-008',
      timestamp: new Date('2024-01-15T17:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('食材制限');
    expect(result.isKnownCategory).toBe(true);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリ一覧: 予算超過', () => {
    const budgetReasonText = '食材の価格が予算上限を大幅に超えている';
    
    const result = classifyMealFeedbackReason({
      reasonText: budgetReasonText,
      userId: 'user-009',
      mealPlanId: 'plan-20240115-009',
      timestamp: new Date('2024-01-15T18:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('予算');
    expect(result.isKnownCategory).toBe(true);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリ一覧: 在庫不足', () => {
    const inventoryReasonText = '冷蔵庫に必要な食材がない';
    
    const result = classifyMealFeedbackReason({
      reasonText: inventoryReasonText,
      userId: 'user-010',
      mealPlanId: 'plan-20240115-010',
      timestamp: new Date('2024-01-15T19:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('在庫');
    expect(result.isKnownCategory).toBe(true);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('理由テキストがnullまたは未定義の場合、未分類として処理される', () => {
    const resultNull = classifyMealFeedbackReason({
      reasonText: null as any,
      userId: 'user-011',
      mealPlanId: 'plan-20240115-011',
      timestamp: new Date('2024-01-15T20:00:00Z').toISOString(),
    });

    expect(resultNull.classifiedCategory).toBe('未分類');
    expect(resultNull.isKnownCategory).toBe(false);
    expect(resultNull.systemErrorOccurred).toBe(false);
  });

  test('既知カテゴリに類似した表現が入力された場合、適切なカテゴリに分類される（曖昧性排除）', () => {
    const similarReasonText = '朝食作るのに時間がかかりすぎる';
    
    const result = classifyMealFeedbackReason({
      reasonText: similarReasonText,
      userId: 'user-012',
      mealPlanId: 'plan-20240115-012',
      timestamp: new Date('2024-01-15T21:00:00Z').toISOString(),
    });

    expect(result.classifiedCategory).toBe('調理時間');
    expect(result.isKnownCategory).toBe(true);
    expect(result.confidence).toBeGreaterThan(60);
    expect(result.systemErrorOccurred).toBe(false);
  });

  test('分類処理実行後、結果レコードに必須フィールドがすべて含まれている', () => {
    const reasonText = 'カテゴリに該当する理由';
    
    const result = classifyMealFeedbackReason({
      reasonText,
      userId: 'user-013',
      mealPlanId: 'plan-20240115-013',
      timestamp: new Date('2024-01-15T22:00:00Z').toISOString(),
    });

    expect(result).toHaveProperty('reasonText');
    expect(result).toHaveProperty('classifiedCategory');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('isKnownCategory');
    expect(result).toHaveProperty('systemErrorOccurred');
    expect(result).toHaveProperty('errorMessage');
    
    expect(typeof result.reasonText).toBe('string');
    expect(typeof result.classifiedCategory).toBe('string');
    expect(typeof result.confidence).toBe('number');
    expect(typeof result.isKnownCategory).toBe('boolean');
    expect(typeof result.systemErrorOccurred).toBe('boolean');
  });

  test('信頼度スコアは0～100の範囲内である', () => {
    const testCases = [
      '調理時間が長すぎた',
      'システムの仕様変更に伴う対応が必要',
      '栄養バランスが悪い',
    ];

    testCases.forEach((reasonText) => {
      const result = classifyMealFeedbackReason({
        reasonText,
        userId: `user-${Date.now()}`,
        mealPlanId: `plan-${Date.now()}`,
        timestamp: new Date('2024-01-15T23:00:00Z').toISOString(),
      });

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });
});