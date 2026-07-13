import { evaluateDietaryRestrictionPriority } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-321
  test('前回更新から6日しか経過していない食事制限情報は即時反映対象にならない', () => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    const lastUpdateDate = new Date('2024-01-09T10:00:00Z'); // 6日前
    const currentDate = new Date('2024-01-15T10:00:00Z');

    const dietaryRestriction = {
      id: 'dr-001',
      userId: 'user-001',
      restrictionType: 'gluten_free',
      description: 'グルテン不耐症',
      lastUpdatedAt: lastUpdateDate,
      addedAt: new Date('2024-01-01T10:00:00Z'),
      isActive: true,
    };

    const result = evaluateDietaryRestrictionPriority(
      dietaryRestriction,
      currentDate
    );

    // 前回更新から6日しか経過していない場合、即時反映対象にならない
    expect(result.shouldReflectImmediately).toBe(false);

    // 優先度が低く設定される（例：1～3のスケール、1が最低）
    expect(result.priority).toBe(1);

    // 次回更新スケジュール対象として扱われる
    expect(result.scheduledForNextUpdate).toBe(true);

    // 経過日数が6日であることを確認
    expect(result.daysSinceLastUpdate).toBe(6);
  });

  test('前回更新から7日以上経過した食事制限情報は即時反映対象になる', () => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    const lastUpdateDate = new Date('2024-01-08T10:00:00Z'); // 7日前
    const currentDate = new Date('2024-01-15T10:00:00Z');

    const dietaryRestriction = {
      id: 'dr-002',
      userId: 'user-001',
      restrictionType: 'vegetarian',
      description: 'ベジタリアン',
      lastUpdatedAt: lastUpdateDate,
      addedAt: new Date('2024-01-01T10:00:00Z'),
      isActive: true,
    };

    const result = evaluateDietaryRestrictionPriority(
      dietaryRestriction,
      currentDate
    );

    // 前回更新から7日以上経過している場合、即時反映対象になる
    expect(result.shouldReflectImmediately).toBe(true);

    // 優先度が高く設定される（例：3が最高）
    expect(result.priority).toBe(3);

    // 次回更新スケジュール対象にならない
    expect(result.scheduledForNextUpdate).toBe(false);

    // 経過日数が7日であることを確認
    expect(result.daysSinceLastUpdate).toBe(7);
  });

  test('新規追加の食事制限情報（更新履歴なし）は即時反映対象になる', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const addedDate = new Date('2024-01-15T09:00:00Z'); // 本日追加

    const dietaryRestriction = {
      id: 'dr-003',
      userId: 'user-002',
      restrictionType: 'nut_allergy',
      description: 'ナッツアレルギー',
      lastUpdatedAt: addedDate,
      addedAt: addedDate,
      isActive: true,
    };

    const result = evaluateDietaryRestrictionPriority(
      dietaryRestriction,
      currentDate
    );

    // 新規追加は即時反映対象になる
    expect(result.shouldReflectImmediately).toBe(true);

    // 優先度が最高に設定される
    expect(result.priority).toBe(3);

    // 次回更新スケジュール対象にならない
    expect(result.scheduledForNextUpdate).toBe(false);

    // 経過日数が0日であることを確認
    expect(result.daysSinceLastUpdate).toBe(0);
  });

  test('非アクティブな食事制限情報は優先度判定から除外される', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const lastUpdateDate = new Date('2024-01-08T10:00:00Z'); // 7日前

    const dietaryRestriction = {
      id: 'dr-004',
      userId: 'user-002',
      restrictionType: 'dairy_free',
      description: 'アレルギー削除済み',
      lastUpdatedAt: lastUpdateDate,
      addedAt: new Date('2024-01-01T10:00:00Z'),
      isActive: false,
    };

    const result = evaluateDietaryRestrictionPriority(
      dietaryRestriction,
      currentDate
    );

    // 非アクティブな場合、即時反映対象にならない
    expect(result.shouldReflectImmediately).toBe(false);

    // 優先度が最低に設定される
    expect(result.priority).toBe(0);

    // 次回更新スケジュール対象にならない
    expect(result.scheduledForNextUpdate).toBe(false);

    // 非アクティブフラグが true であることを確認
    expect(result.isInactive).toBe(true);
  });

  test('入力データが不正な場合、エラーがスローされる', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');

    const invalidDietaryRestriction = {
      id: '',
      userId: 'user-001',
      restrictionType: 'gluten_free',
      description: 'グルテン不耐症',
      lastUpdatedAt: new Date('2024-01-09T10:00:00Z'),
      addedAt: new Date('2024-01-01T10:00:00Z'),
      isActive: true,
    };

    expect(() =>
      evaluateDietaryRestrictionPriority(invalidDietaryRestriction, currentDate)
    ).toThrow(/id/);
  });

  test('前回更新日時が未来の場合、エラーがスローされる', () => {
    const currentDate = new Date('2024-01-15T10:00:00Z');
    const futureDate = new Date('2024-01-16T10:00:00Z');

    const dietaryRestriction = {
      id: 'dr-005',
      userId: 'user-001',
      restrictionType: 'gluten_free',
      description: 'グルテン不耐症',
      lastUpdatedAt: futureDate,
      addedAt: new Date('2024-01-01T10:00:00Z'),
      isActive: true,
    };

    expect(() =>
      evaluateDietaryRestrictionPriority(dietaryRestriction, currentDate)
    ).toThrow(/更新日時/);
  });
});