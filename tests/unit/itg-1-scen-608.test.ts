import { classifyRejectionReason } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-608
  test('献立却下修正理由の自動分類 - 未定義の却下理由が入力された場合にエラーまたはデフォルト分類される', () => {
    const validCategories = [
      'nutritionImbalance',
      'familyPreferenceNotMet',
      'cookingTimeExceeded',
      'dietaryRestrictionMissed',
      'budgetExceeded',
      'ingredientUnavailable'
    ];

    // ケース1: 定義済みカテゴリが入力された場合 - 成功パス
    const validReasonInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_001',
      reasonText: '調理時間が長すぎた',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString()
    };

    const validResult = classifyRejectionReason(validReasonInput);
    expect(validResult.classified).toBe(true);
    expect(validCategories).toContain(validResult.category);
    expect(validResult.confidence).toBeGreaterThanOrEqual(0);
    expect(validResult.confidence).toBeLessThanOrEqual(100);

    // ケース2: 完全に未定義・意味不明な理由が入力された場合 - デフォルト分類
    const undefinedReasonInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_002',
      reasonText: 'xyzabc12345!@#$',
      timestamp: new Date('2024-01-15T11:05:00Z').toISOString()
    };

    const undefinedResult = classifyRejectionReason(undefinedReasonInput);
    expect(undefinedResult.classified).toBe(true);
    expect(undefinedResult.category).toBe('other');
    expect(undefinedResult.confidence).toBeGreaterThanOrEqual(0);
    expect(undefinedResult.confidence).toBeLessThanOrEqual(100);

    // ケース3: 空文字列が入力された場合 - エラーまたはデフォルト分類
    const emptyReasonInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_003',
      reasonText: '',
      timestamp: new Date('2024-01-15T11:10:00Z').toISOString()
    };

    expect(() => {
      classifyRejectionReason(emptyReasonInput);
    }).toThrow(/理由|テキスト|入力/);

    // ケース4: null/undefined が入力された場合 - エラーハンドリング
    const nullReasonInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_004',
      reasonText: null as any,
      timestamp: new Date('2024-01-15T11:15:00Z').toISOString()
    };

    expect(() => {
      classifyRejectionReason(nullReasonInput);
    }).toThrow(/必須|入力/);

    // ケース5: 部分的に有効な理由が入力された場合 - 最適なマッチングで分類
    const partialReasonInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_005',
      reasonText: '栄養バランスがおかしい気がします',
      timestamp: new Date('2024-01-15T11:20:00Z').toISOString()
    };

    const partialResult = classifyRejectionReason(partialReasonInput);
    expect(partialResult.classified).toBe(true);
    expect(partialResult.category).toBe('nutritionImbalance');
    expect(partialResult.confidence).toBeGreaterThan(50);

    // ケース6: 複数のキーワードが混在した場合 - 最初のキーワードの優先度で分類
    const multiKeywordInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_006',
      reasonText: '調理時間が長くて予算も超過している',
      timestamp: new Date('2024-01-15T11:25:00Z').toISOString()
    };

    const multiKeywordResult = classifyRejectionReason(multiKeywordInput);
    expect(multiKeywordResult.classified).toBe(true);
    expect(['cookingTimeExceeded', 'budgetExceeded']).toContain(multiKeywordResult.category);
    expect(multiKeywordResult.confidence).toBeGreaterThan(0);

    // ケース7: 非常に長いテキストが入力された場合 - キーワード抽出して分類
    const longReasonInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_007',
      reasonText: '今日は家族が集まる日で、みんなで食べたいものをリクエストしてくれたのですが、生成された献立に家族の好みが反映されていないようです。子どもたちが全然食べてくれなかった。',
      timestamp: new Date('2024-01-15T11:30:00Z').toISOString()
    };

    const longResult = classifyRejectionReason(longReasonInput);
    expect(longResult.classified).toBe(true);
    expect(longResult.category).toBe('familyPreferenceNotMet');
    expect(longResult.confidence).toBeGreaterThan(60);

    // ケース8: 日本語以外の言語で理由が入力された場合 - デフォルト分類
    const foreignLanguageInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_008',
      reasonText: 'This does not match my family preference at all',
      timestamp: new Date('2024-01-15T11:35:00Z').toISOString()
    };

    const foreignResult = classifyRejectionReason(foreignLanguageInput);
    expect(foreignResult.classified).toBe(true);
    expect(['other', 'familyPreferenceNotMet']).toContain(foreignResult.category);

    // ケース9: 理由テキストが改行やホワイトスペースのみの場合 - エラーまたはデフォルト分類
    const whitespaceOnlyInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_009',
      reasonText: '   \n\t  ',
      timestamp: new Date('2024-01-15T11:40:00Z').toISOString()
    };

    expect(() => {
      classifyRejectionReason(whitespaceOnlyInput);
    }).toThrow(/理由|テキスト|空白/);

    // ケース10: 記録が正常に分類されたときの監査ログ記録確認
    const auditCheckInput = {
      userId: 'user_001',
      mealId: 'meal_20240115_010',
      reasonText: 'アレルギー対応がされていない',
      timestamp: new Date('2024-01-15T11:45:00Z').toISOString()
    };

    const auditResult = classifyRejectionReason(auditCheckInput);
    expect(auditResult.classified).toBe(true);
    expect(auditResult.auditLog).toBeDefined();
    expect(auditResult.auditLog.userId).toBe('user_001');
    expect(auditResult.auditLog.mealId).toBe('meal_20240115_010');
    expect(auditResult.auditLog.classificationTime).toBeDefined();
    expect(auditResult.auditLog.originalText).toBe('アレルギー対応がされていない');
    expect(auditResult.auditLog.classifiedCategory).toBeDefined();
  });
});