import { validateAndApproveShoppingList } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-229: [edge] 買い物リスト承認却下判定機能 - 買い物リストが空の場合、承認判定が適切に処理される
  test('買い物リストが空の場合、バリデーションエラーを返し承認判定を実行しない', () => {
    const emptyShoppingList = {
      userId: 'user_001',
      familyId: 'family_001',
      items: [],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      approvalStatus: 'pending' as const,
    };

    expect(() => {
      validateAndApproveShoppingList(emptyShoppingList, 'approve');
    }).toThrow(/買い物リスト/);
  });

  test('買い物リストが正常な場合、承認判定を実行し成功ステータスを返す', () => {
    const validShoppingList = {
      userId: 'user_001',
      familyId: 'family_001',
      items: [
        {
          ingredientId: 'ing_001',
          ingredientName: 'トマト',
          quantity: 3,
          unit: '個',
          estimatedPrice: 450,
        },
        {
          ingredientId: 'ing_002',
          ingredientName: '玉ねぎ',
          quantity: 2,
          unit: '個',
          estimatedPrice: 300,
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      approvalStatus: 'pending' as const,
    };

    const result = validateAndApproveShoppingList(
      validShoppingList,
      'approve'
    );

    expect(result).toEqual({
      success: true,
      approvalStatus: 'approved',
      userId: 'user_001',
      familyId: 'family_001',
      itemCount: 2,
      estimatedTotalPrice: 750,
      processedAt: expect.any(String),
    });
  });

  test('買い物リストが正常な場合、却下判定を実行し却下ステータスを返す', () => {
    const validShoppingList = {
      userId: 'user_001',
      familyId: 'family_001',
      items: [
        {
          ingredientId: 'ing_001',
          ingredientName: 'キャベツ',
          quantity: 1,
          unit: '個',
          estimatedPrice: 200,
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      approvalStatus: 'pending' as const,
    };

    const result = validateAndApproveShoppingList(
      validShoppingList,
      'reject',
      '栄養バランスが不適切'
    );

    expect(result).toEqual({
      success: true,
      approvalStatus: 'rejected',
      userId: 'user_001',
      familyId: 'family_001',
      rejectionReason: '栄養バランスが不適切',
      processedAt: expect.any(String),
    });
  });

  test('買い物リストが null の場合、バリデーションエラーを返す', () => {
    expect(() => {
      validateAndApproveShoppingList(null as any, 'approve');
    }).toThrow(/買い物リスト/);
  });

  test('買い物リストの items が undefined の場合、バリデーションエラーを返す', () => {
    const invalidShoppingList = {
      userId: 'user_001',
      familyId: 'family_001',
      items: undefined as any,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      approvalStatus: 'pending' as const,
    };

    expect(() => {
      validateAndApproveShoppingList(invalidShoppingList, 'approve');
    }).toThrow(/買い物リスト/);
  });

  test('不正な承認判定操作が指定された場合、エラーを返す', () => {
    const validShoppingList = {
      userId: 'user_001',
      familyId: 'family_001',
      items: [
        {
          ingredientId: 'ing_001',
          ingredientName: 'ニンジン',
          quantity: 5,
          unit: '本',
          estimatedPrice: 600,
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      approvalStatus: 'pending' as const,
    };

    expect(() => {
      validateAndApproveShoppingList(validShoppingList, 'invalid' as any);
    }).toThrow(/判定/);
  });
});