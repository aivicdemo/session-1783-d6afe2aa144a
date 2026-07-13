import { filterAnomalousExpenses } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-440: [edge] 異常値・欠損値の自動フィルタリング - 異常値判定の閾値が境界値で指定された場合、閾値直前のデータは正常、閾値以上のデータは異常と判定される
  test('閾値境界値での異常値判定: 4999円は正常、5000円以上は異常と判定される', () => {
    const threshold = 5000;
    const expenses = [
      { id: 1, amount: 4999, date: '2024-01-01', category: 'food' },
      { id: 2, amount: 5000, date: '2024-01-02', category: 'food' },
      { id: 3, amount: 5001, date: '2024-01-03', category: 'food' },
      { id: 4, amount: 4500, date: '2024-01-04', category: 'food' },
      { id: 5, amount: 6000, date: '2024-01-05', category: 'food' }
    ];

    const result = filterAnomalousExpenses(expenses, threshold);

    // 期待値の検証
    expect(result.normal).toEqual([
      { id: 1, amount: 4999, date: '2024-01-01', category: 'food' },
      { id: 4, amount: 4500, date: '2024-01-04', category: 'food' }
    ]);

    expect(result.anomalous).toEqual([
      { id: 2, amount: 5000, date: '2024-01-02', category: 'food' },
      { id: 3, amount: 5001, date: '2024-01-03', category: 'food' },
      { id: 5, amount: 6000, date: '2024-01-05', category: 'food' }
    ]);

    expect(result.normalCount).toBe(2);
    expect(result.anomalousCount).toBe(3);
    expect(result.filteringLog).toContain('threshold: 5000');
  });
});