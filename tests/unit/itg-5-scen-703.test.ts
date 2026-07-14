import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-703: [error] 失敗パターン集計 - 集計期間の日付パラメータが不正な場合、バリデーションエラーを返す
  test('should return validation error when aggregation period has invalid date parameters', () => {
    // ケース1: 不正な開始日付（存在しない月）
    expect(() => {
      aggregateFailurePatterns({
        start_date: '2024-13-45',
        end_date: '2024-12-31',
      });
    }).toThrow(/日付形式/);

    // ケース2: 不正な終了日付（存在しない日）
    expect(() => {
      aggregateFailurePatterns({
        start_date: '2024-01-01',
        end_date: '2024-02-30',
      });
    }).toThrow(/日付形式/);

    // ケース3: 終了日付が開始日付より前の場合
    expect(() => {
      aggregateFailurePatterns({
        start_date: '2024-12-31',
        end_date: '2024-01-01',
      });
    }).toThrow(/終了日付/);

    // ケース4: 開始日付がnull
    expect(() => {
      aggregateFailurePatterns({
        start_date: null as any,
        end_date: '2024-12-31',
      });
    }).toThrow(/日付形式/);

    // ケース5: 終了日付がundefined
    expect(() => {
      aggregateFailurePatterns({
        start_date: '2024-01-01',
        end_date: undefined as any,
      });
    }).toThrow(/日付形式/);

    // ケース6: 正しい日付形式で有効な期間の場合は正常に処理される
    const valid_result = aggregateFailurePatterns({
      start_date: '2024-01-01',
      end_date: '2024-01-31',
    });
    expect(valid_result).toHaveProperty('aggregation_start_date');
    expect(valid_result).toHaveProperty('aggregation_end_date');
    expect(valid_result.aggregation_start_date).toBe('2024-01-01');
    expect(valid_result.aggregation_end_date).toBe('2024-01-31');
  });
});