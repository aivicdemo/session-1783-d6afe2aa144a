import { detectConflictingMeals } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-487
  test('新しい食事制限条件が過去献立と抵触する場合、抵触パターンと変更者情報が監査ログに正しく記録される', () => {
    // 前提: テストユーザーでログイン済み、過去30日間の献立履歴が存在
    const userId = 'user-001';
    const changeUserId = 'user-001';
    const changeTimestamp = new Date('2024-01-15T14:30:00Z');

    // 過去献立履歴（30日間）
    const pastMealHistory = [
      {
        mealId: 'meal-001',
        mealDate: new Date('2024-01-10T19:00:00Z'),
        dishes: [
          { dishName: 'えび天ぷら', ingredients: ['えび', '小麦粉', '卵'] },
          { dishName: 'そばサラダ', ingredients: ['そば', 'トマト'] },
        ],
      },
      {
        mealId: 'meal-002',
        mealDate: new Date('2024-01-12T18:30:00Z'),
        dishes: [
          { dishName: 'ナッツサラダ', ingredients: ['アーモンド', 'くるみ', 'レタス'] },
          { dishName: 'チキンステーキ', ingredients: ['鶏肉', 'バター'] },
        ],
      },
      {
        mealId: 'meal-003',
        mealDate: new Date('2024-01-14T18:00:00Z'),
        dishes: [
          {
            dishName: 'ピーナッツバターサンドイッチ',
            ingredients: ['ピーナッツ', '食パン', 'バター'],
          },
          { dishName: '牛乳', ingredients: ['牛乳'] },
        ],
      },
    ];

    // 食事制限条件の変更前（現在の条件）
    const previousRestrictions = {
      allergens: ['卵'],
      nutritionRestrictions: [],
      otherRestrictions: [],
    };

    // 食事制限条件の変更後（新しい条件：複数アレルギー追加）
    const newRestrictions = {
      allergens: ['卵', 'えび', 'ナッツ類', '乳製品'],
      nutritionRestrictions: [],
      otherRestrictions: [],
    };

    // detectConflictingMeals 関数呼び出し
    const result = detectConflictingMeals({
      userId,
      pastMealHistory,
      previousRestrictions,
      newRestrictions,
      changeUserId,
      changeTimestamp,
    });

    // 期待値: 抵触検出ステータス
    expect(result.detectionStatus).toBe('detected');

    // 期待値: 抵触献立数（3件すべてが新制限に抵触）
    expect(result.conflictingMealCount).toBe(3);

    // 期待値: 抵触パターン詳細
    expect(result.conflictingPatterns).toEqual([
      {
        mealId: 'meal-001',
        mealDate: '2024-01-10T19:00:00Z',
        conflictingIngredients: ['えび', '卵'],
        conflictingAllergens: ['えび', '卵'],
        severity: 'high',
      },
      {
        mealId: 'meal-002',
        mealDate: '2024-01-12T18:30:00Z',
        conflictingIngredients: ['アーモンド', 'くるみ', 'バター'],
        conflictingAllergens: ['ナッツ類', '乳製品'],
        severity: 'high',
      },
      {
        mealId: 'meal-003',
        mealDate: '2024-01-14T18:00:00Z',
        conflictingIngredients: ['ピーナッツ', 'バター', '牛乳'],
        conflictingAllergens: ['ナッツ類', '乳製品'],
        severity: 'high',
      },
    ]);

    // 期待値: 監査ログエントリ
    expect(result.auditLogEntry).toBeDefined();
    expect(result.auditLogEntry.userId).toBe('user-001');
    expect(result.auditLogEntry.changeTimestamp).toEqual(changeTimestamp);
    expect(result.auditLogEntry.changeUserIdRecorded).toBe(changeUserId);
    expect(result.auditLogEntry.previousRestrictionsRecorded).toEqual(previousRestrictions);
    expect(result.auditLogEntry.newRestrictionsRecorded).toEqual(newRestrictions);
    expect(result.auditLogEntry.conflictDetectionStatus).toBe('detected');
    expect(result.auditLogEntry.conflictingMealCountRecorded).toBe(3);
    expect(result.auditLogEntry.conflictingPatternsRecorded).toHaveLength(3);

    // 期待値: 暗号署名を含む
    expect(result.auditLogEntry.cryptographicSignature).toBeDefined();
    expect(typeof result.auditLogEntry.cryptographicSignature).toBe('string');
    expect(result.auditLogEntry.cryptographicSignature.length).toBeGreaterThan(0);

    // 期待値: ログエントリが改ざん防止用の整合性チェックフィールドを含む
    expect(result.auditLogEntry.integrityHash).toBeDefined();
    expect(typeof result.auditLogEntry.integrityHash).toBe('string');

    // 期待値: 検索・フィルタ用のメタデータ
    expect(result.auditLogEntry.searchableFields).toBeDefined();
    expect(result.auditLogEntry.searchableFields.conflictDetectionStatus).toBe('detected');
    expect(result.auditLogEntry.searchableFields.conflictingMealCount).toBe(3);
    expect(Array.isArray(result.auditLogEntry.searchableFields.conflictingAllergenList)).toBe(
      true,
    );
    expect(result.auditLogEntry.searchableFields.conflictingAllergenList).toContain('えび');
    expect(result.auditLogEntry.searchableFields.conflictingAllergenList).toContain('ナッツ類');
    expect(result.auditLogEntry.searchableFields.conflictingAllergenList).toContain('乳製品');

    // 期待値: 新旧制限条件の差分記録
    expect(result.auditLogEntry.restrictionChangeDiff).toBeDefined();
    expect(result.auditLogEntry.restrictionChangeDiff.addedAllergens).toEqual([
      'えび',
      'ナッツ類',
      '乳製品',
    ]);
    expect(result.auditLogEntry.restrictionChangeDiff.removedAllergens).toEqual([]);

    // 期待値: タイムスタンプがISO形式
    expect(result.auditLogEntry.changeTimestamp).toBeInstanceOf(Date);
    expect(result.auditLogEntry.changeTimestamp.toISOString()).toBe('2024-01-15T14:30:00.000Z');

    // 期待値: 監査ログが検索対象になるメタデータを含む
    expect(result.isSearchableByConflictCount).toBe(true);
    expect(result.searchFilterMeta).toEqual({
      filterableByConflictStatus: true,
      filterableByConflictingAllergens: true,
      filterableByMealDateRange: true,
      filterableBySeverity: true,
    });
  });
});