import { aggregateMonthlyCostReductionEffect } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-391
  test('月間の購入記録が存在しない場合にエラーハンドリングが機能する', () => {
    const targetYear = 2024;
    const targetMonth = 3;
    const purchaseRecords: Array<{
      id: string;
      purchase_date: string;
      amount: number;
      category: string;
    }> = [];

    expect(() =>
      aggregateMonthlyCostReductionEffect({
        target_year: targetYear,
        target_month: targetMonth,
        purchase_records: purchaseRecords,
      })
    ).toThrow(/購入記録/);
  });
});