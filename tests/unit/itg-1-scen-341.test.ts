import { validateAndNormalizeInventory } from '../../src/logic/it-1-1-1';

describe('冷蔵庫在庫情報の正規化・バリデーション - 本日が賞味期限の食材', () => {
  test('SCEN-341: 本日が賞味期限の食材が正常に受け入れられ、本日の献立制約に反映される', () => {
    // 固定日付を使用: テスト実行日を 2024-12-19 として設定
    const today = new Date('2024-12-19T00:00:00Z');
    const tomorrow = new Date('2024-12-20T00:00:00Z');

    // 本日が賞味期限の食材入力データ
    const inventoryInput = {
      foodName: '牛乳',
      quantity: 1,
      quantityUnit: 'パック',
      expiryDate: '2024-12-19',
      storageLocation: '冷蔵庫',
    };

    // バリデーション・正規化処理を実行
    const validationResult = validateAndNormalizeInventory(inventoryInput, today);

    // 期待値1: バリデーションが成功（errors は空配列）
    expect(validationResult.errors).toEqual([]);

    // 期待値2: 食材が正常に受け入れられた状態を示す
    expect(validationResult.isValid).toBe(true);

    // 期待値3: 正規化されたデータが返される
    expect(validationResult.normalized).toEqual({
      foodName: '牛乳',
      quantity: 1,
      quantityUnit: 'パック',
      expiryDate: new Date('2024-12-19T00:00:00Z'),
      storageLocation: '冷蔵庫',
    });

    // 期待値4: 本日の献立生成に対して制約条件として適用される
    // (expiryDateStatus が 'available_today' であることを確認)
    expect(validationResult.normalized.expiryDateStatus).toBe('available_today');

    // 期待値5: 本日は食材が利用可能
    expect(validationResult.canUseOnDate(today)).toBe(true);

    // 期待値6: 翌日以降は食材が利用不可
    expect(validationResult.canUseOnDate(tomorrow)).toBe(false);

    // 期待値7: 食材が献立制約条件に正常に追加されたことを確認
    expect(validationResult.mealPlanConstraints).toEqual({
      availableFoods: ['牛乳'],
      constraintAppliedDate: '2024-12-19',
      excludeFoodsFromDate: '2024-12-20',
    });
  });
});