import { validateRefrigeratorInventory } from '../../src/logic/it-1-1-1';

describe('冷蔵庫在庫情報の正規化・バリデーション', () => {
  // SCEN-343
  test('数量が負の値で入力されたときエラーが返される', () => {
    const invalidInventoryInput = {
      ingredientName: 'トマト',
      quantity: -5,
      unit: '個',
      expiryDate: '2024-12-31',
    };

    expect(() => validateRefrigeratorInventory(invalidInventoryInput)).toThrow(/数量/);
  });
});