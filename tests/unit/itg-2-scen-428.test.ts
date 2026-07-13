import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { aggregateMonthlyCostExpenses } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費実績集計ダッシュボード機能', () => {
  // SCEN-428: [edge] 月末日の深夜から翌月1日の早朝への日時遷移時、月別の食費実績が正確に区分されること

  test('月末日23:59:59から翌月1日00:00:01への遷移時、当月と翌月の食費実績が正確に区分されること', () => {
    // 当月末日 23:59:59 時点での食費実績データ
    const currentMonthEndData = {
      userId: 'user_001',
      timestamp: new Date('2024-01-31T23:59:59Z'),
      expenses: [
        { date: '2024-01-01', amount: 2500, categoryId: 'cat_001' },
        { date: '2024-01-15', amount: 3200, categoryId: 'cat_002' },
        { date: '2024-01-30', amount: 2800, categoryId: 'cat_001' },
        { date: '2024-01-31', amount: 1500, categoryId: 'cat_003' },
      ],
      targetMonth: '2024-01',
    };

    // 当月のダッシュボード集計結果
    const currentMonthResult = aggregateMonthlyCostExpenses(currentMonthEndData);

    // 当月の実績合計 = 2500 + 3200 + 2800 + 1500 = 10000円
    expect(currentMonthResult.totalAmount).toBe(10000);
    expect(currentMonthResult.month).toBe('2024-01');
    expect(currentMonthResult.expenseCount).toBe(4);

    // 翌月1日 00:00:01 時点での食費実績データ
    // 翌月1日のデータが追加された状態
    const nextMonthStartData = {
      userId: 'user_001',
      timestamp: new Date('2024-02-01T00:00:01Z'),
      expenses: [
        { date: '2024-01-01', amount: 2500, categoryId: 'cat_001' },
        { date: '2024-01-15', amount: 3200, categoryId: 'cat_002' },
        { date: '2024-01-30', amount: 2800, categoryId: 'cat_001' },
        { date: '2024-01-31', amount: 1500, categoryId: 'cat_003' },
        { date: '2024-02-01', amount: 1800, categoryId: 'cat_001' },
      ],
      targetMonth: '2024-01',
    };

    // 当月のデータを改めて集計（翌月1日時点で当月フィルタを指定した場合）
    const currentMonthResultAfterTransition = aggregateMonthlyCostExpenses(
      nextMonthStartData
    );

    // 当月の実績合計は変化しないこと（翌月1日のデータは含まれない）
    expect(currentMonthResultAfterTransition.totalAmount).toBe(10000);
    expect(currentMonthResultAfterTransition.month).toBe('2024-01');
    expect(currentMonthResultAfterTransition.expenseCount).toBe(4);

    // 翌月のデータを集計
    const nextMonthData = {
      userId: 'user_001',
      timestamp: new Date('2024-02-01T00:00:01Z'),
      expenses: [
        { date: '2024-02-01', amount: 1800, categoryId: 'cat_001' },
      ],
      targetMonth: '2024-02',
    };

    const nextMonthResult = aggregateMonthlyCostExpenses(nextMonthData);

    // 翌月の実績合計 = 1800円（翌月1日のデータのみ）
    expect(nextMonthResult.totalAmount).toBe(1800);
    expect(nextMonthResult.month).toBe('2024-02');
    expect(nextMonthResult.expenseCount).toBe(1);

    // 月別フィルタを「前月」に設定して当月データを再度表示
    const previousMonthFilterData = {
      userId: 'user_001',
      timestamp: new Date('2024-02-01T00:00:01Z'),
      expenses: [
        { date: '2024-01-01', amount: 2500, categoryId: 'cat_001' },
        { date: '2024-01-15', amount: 3200, categoryId: 'cat_002' },
        { date: '2024-01-30', amount: 2800, categoryId: 'cat_001' },
        { date: '2024-01-31', amount: 1500, categoryId: 'cat_003' },
      ],
      targetMonth: '2024-01',
    };

    const previousMonthFilterResult = aggregateMonthlyCostExpenses(
      previousMonthFilterData
    );

    // 前月フィルタでの当月の実績合計が、ステップ1でメモした値（10000円）と一致すること
    expect(previousMonthFilterResult.totalAmount).toBe(10000);
    expect(previousMonthFilterResult.month).toBe('2024-01');
    expect(previousMonthFilterResult.expenseCount).toBe(4);

    // 当月と翌月のデータが混在していないことを確認
    const mixedData = {
      userId: 'user_001',
      timestamp: new Date('2024-02-01T00:00:01Z'),
      expenses: [
        { date: '2024-01-01', amount: 2500, categoryId: 'cat_001' },
        { date: '2024-01-15', amount: 3200, categoryId: 'cat_002' },
        { date: '2024-01-30', amount: 2800, categoryId: 'cat_001' },
        { date: '2024-01-31', amount: 1500, categoryId: 'cat_003' },
        { date: '2024-02-01', amount: 1800, categoryId: 'cat_001' },
      ],
      targetMonth: '2024-01',
    };

    const mixedDataResult = aggregateMonthlyCostExpenses(mixedData);

    // 当月フィルタ時は翌月のデータ（2024-02-01）が集計対象外であること
    expect(mixedDataResult.totalAmount).toBe(10000);
    expect(mixedDataResult.expenseCount).toBe(4);
  });
});