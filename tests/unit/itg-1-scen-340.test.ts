import { normalizeAndValidateRefrigeratorInventory } from '../../src/logic/it-1-1-1';

describe('冷蔵庫在庫情報の正規化・バリデーション', () => {
  test('SCEN-340: 食材名・数量・賞味期限が正しい形式で入力された場合、正規化されて制約条件に反映される', () => {
    // Arrange
    const input = {
      ingredient_name: 'トマト',
      quantity: 500,
      unit: 'g',
      expiration_date: '2024-12-25',
    };

    // Act
    const result = normalizeAndValidateRefrigeratorInventory(input);

    // Assert - 正規化されたデータが正しく返される
    expect(result).toEqual({
      normalized_ingredient_name: 'トマト',
      normalized_quantity_with_unit: '500g',
      normalized_expiration_date: '2024-12-25',
      is_valid: true,
      validation_errors: [],
      constraint_reflection_status: 'ready_for_generation',
    });

    // Assert - バリデーションエラーが発生しないこと
    expect(result.is_valid).toBe(true);
    expect(result.validation_errors.length).toBe(0);

    // Assert - 制約条件に反映可能な状態であること
    expect(result.constraint_reflection_status).toBe('ready_for_generation');

    // Assert - 正規化されたデータ形式が献立生成ロジックに渡すために適切であること
    expect(result.normalized_ingredient_name).toBe('トマト');
    expect(result.normalized_quantity_with_unit).toBe('500g');
    expect(result.normalized_expiration_date).toBe('2024-12-25');
  });
});