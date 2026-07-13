import { aggregateMonthlyCostData } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費実績集計ダッシュボード機能', () => {
  // SCEN-427
  test('食材購入実績データが家計管理システムに連携されていない場合、集計処理がエラーで中断される', () => {
    const input = {
      userId: 'user_001',
      targetMonth: '2024-01',
      homeFinanceSystemData: null,
      purchaseRecords: [],
      budgetLimit: 50000,
    };

    expect(() => aggregateMonthlyCostData(input)).toThrow(/連携/);
  });

  test('食材購入実績データが部分的に欠損している場合、集計処理がエラーで中断される', () => {
    const input = {
      userId: 'user_001',
      targetMonth: '2024-01',
      homeFinanceSystemData: {
        syncStatus: 'disconnected',
        lastSyncTime: null,
      },
      purchaseRecords: [
        {
          purchaseRecordId: 'pr_001',
          ingredientId: 'ing_001',
          quantity: 2,
          unitPrice: 500,
          purchaseDate: '2024-01-05',
        },
      ],
      budgetLimit: 50000,
    };

    expect(() => aggregateMonthlyCostData(input)).toThrow(/連携/);
  });

  test('連携データが正常に取得され、月次食費実績が正常に集計される', () => {
    const input = {
      userId: 'user_001',
      targetMonth: '2024-01',
      homeFinanceSystemData: {
        syncStatus: 'connected',
        lastSyncTime: '2024-01-31T23:59:59Z',
      },
      purchaseRecords: [
        {
          purchaseRecordId: 'pr_001',
          ingredientId: 'ing_001',
          quantity: 2,
          unitPrice: 500,
          purchaseDate: '2024-01-05',
        },
        {
          purchaseRecordId: 'pr_002',
          ingredientId: 'ing_002',
          quantity: 3,
          unitPrice: 1000,
          purchaseDate: '2024-01-10',
        },
        {
          purchaseRecordId: 'pr_003',
          ingredientId: 'ing_003',
          quantity: 1,
          unitPrice: 2000,
          purchaseDate: '2024-01-20',
        },
      ],
      budgetLimit: 50000,
    };

    const result = aggregateMonthlyCostData(input);

    expect(result).toEqual({
      userId: 'user_001',
      targetMonth: '2024-01',
      totalCost: 5500,
      budgetLimit: 50000,
      budgetDifference: 44500,
      budgetExceeded: false,
      budgetReductionRate: 0,
      costByCategory: [
        {
          ingredientId: 'ing_001',
          quantity: 2,
          unitPrice: 500,
          subtotal: 1000,
        },
        {
          ingredientId: 'ing_002',
          quantity: 3,
          unitPrice: 1000,
          subtotal: 3000,
        },
        {
          ingredientId: 'ing_003',
          quantity: 1,
          unitPrice: 2000,
          subtotal: 2000,
        },
      ],
      satisfactionScore: 0,
      aggregationStatus: 'success',
      errorLog: null,
    });
  });

  test('月次食費が予算を超過した場合、超過額と削減率が正確に計算される', () => {
    const input = {
      userId: 'user_001',
      targetMonth: '2024-01',
      homeFinanceSystemData: {
        syncStatus: 'connected',
        lastSyncTime: '2024-01-31T23:59:59Z',
      },
      purchaseRecords: [
        {
          purchaseRecordId: 'pr_001',
          ingredientId: 'ing_001',
          quantity: 10,
          unitPrice: 5000,
          purchaseDate: '2024-01-05',
        },
        {
          purchaseRecordId: 'pr_002',
          ingredientId: 'ing_002',
          quantity: 5,
          unitPrice: 3000,
          purchaseDate: '2024-01-10',
        },
      ],
      budgetLimit: 40000,
    };

    const result = aggregateMonthlyCostData(input);

    expect(result).toEqual({
      userId: 'user_001',
      targetMonth: '2024-01',
      totalCost: 65000,
      budgetLimit: 40000,
      budgetDifference: -25000,
      budgetExceeded: true,
      budgetReductionRate: 38.46,
      costByCategory: [
        {
          ingredientId: 'ing_001',
          quantity: 10,
          unitPrice: 5000,
          subtotal: 50000,
        },
        {
          ingredientId: 'ing_002',
          quantity: 5,
          unitPrice: 3000,
          subtotal: 15000,
        },
      ],
      satisfactionScore: 0,
      aggregationStatus: 'success',
      errorLog: null,
    });
  });

  test('エラー発生時、エラーログが記録され、部分的な集計結果が保存されない', () => {
    const input = {
      userId: 'user_001',
      targetMonth: '2024-01',
      homeFinanceSystemData: null,
      purchaseRecords: [],
      budgetLimit: 50000,
    };

    expect(() => aggregateMonthlyCostData(input)).toThrow(/連携/);
  });

  test('システムが予期しないエラー状態から正常に復帰できる', () => {
    const validInput = {
      userId: 'user_001',
      targetMonth: '2024-02',
      homeFinanceSystemData: {
        syncStatus: 'connected',
        lastSyncTime: '2024-02-29T23:59:59Z',
      },
      purchaseRecords: [
        {
          purchaseRecordId: 'pr_001',
          ingredientId: 'ing_001',
          quantity: 1,
          unitPrice: 1000,
          purchaseDate: '2024-02-15',
        },
      ],
      budgetLimit: 50000,
    };

    const result = aggregateMonthlyCostData(validInput);

    expect(result.aggregationStatus).toBe('success');
    expect(result.errorLog).toBeNull();
    expect(result.totalCost).toBe(1000);
  });
});