import { generatePainMatrixByPriority } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能 - ペイン要因自動分類', () => {
  // SCEN-389
  test('複数の離脱理由が同一優先度の場合に優先度マトリクスが正しく生成される', () => {
    const test_withdrawal_reasons = [
      {
        withdrawal_reason_id: 'wr_001',
        reason_text: '献立案の調理時間が長すぎた',
        priority_level: 3,
        importance_score: 5,
        registration_order: 1,
      },
      {
        withdrawal_reason_id: 'wr_002',
        reason_text: '予算超過のため却下',
        priority_level: 3,
        importance_score: 5,
        registration_order: 2,
      },
      {
        withdrawal_reason_id: 'wr_003',
        reason_text: 'アレルギー対応漏れ',
        priority_level: 3,
        importance_score: 5,
        registration_order: 3,
      },
      {
        withdrawal_reason_id: 'wr_004',
        reason_text: '家族の嗜好に不一致',
        priority_level: 3,
        importance_score: 5,
        registration_order: 4,
      },
    ];

    const test_matrix = generatePainMatrixByPriority(test_withdrawal_reasons);

    // 優先度マトリクス構造の検証
    expect(test_matrix).toEqual(
      expect.objectContaining({
        matrix_id: expect.any(String),
        total_rows: 1,
        total_columns: 4,
        cells: expect.any(Array),
        generated_at: expect.any(String),
      })
    );

    // 行数・列数の正確性を検証
    expect(test_matrix.total_rows).toBe(1);
    expect(test_matrix.total_columns).toBe(4);

    // マトリクスセル数の検証
    expect(test_matrix.cells).toHaveLength(4);

    // 同一優先度のセル内で全離脱理由が分類されていることを検証
    const cell_at_priority_3 = test_matrix.cells.find(
      (cell: any) => cell.priority_level === 3 && cell.importance_score === 5
    );
    expect(cell_at_priority_3).toBeDefined();

    // セル内の離脱理由が登録順序でソートされていることを検証
    const reasons_in_cell = test_matrix.cells
      .filter((cell: any) => cell.priority_level === 3 && cell.importance_score === 5)
      .map((cell: any) => cell.withdrawal_reason_id);

    expect(reasons_in_cell).toEqual([
      'wr_001',
      'wr_002',
      'wr_003',
      'wr_004',
    ]);

    // 各セルの構造を検証
    test_matrix.cells.forEach((cell: any) => {
      expect(cell).toEqual(
        expect.objectContaining({
          cell_id: expect.any(String),
          priority_level: 3,
          importance_score: 5,
          withdrawal_reason_id: expect.any(String),
          reason_text: expect.any(String),
          row_index: 0,
          column_index: expect.any(Number),
          sort_order: expect.any(Number),
        })
      );
    });

    // マトリクスに重複がないことを検証
    const unique_reason_ids = new Set(
      test_matrix.cells.map((cell: any) => cell.withdrawal_reason_id)
    );
    expect(unique_reason_ids.size).toBe(4);

    // 各列索引が0から3までで連続していることを検証
    const column_indices = test_matrix.cells
      .map((cell: any) => cell.column_index)
      .sort((a: number, b: number) => a - b);
    expect(column_indices).toEqual([0, 1, 2, 3]);

    // sort_order フィールドが登録順序を反映していることを検証
    test_matrix.cells.forEach((cell: any, index: number) => {
      expect(cell.sort_order).toBe(index + 1);
    });

    // マトリクス全体の重複・欠落がないことを検証
    const expected_cell_count = test_matrix.total_rows * test_matrix.total_columns;
    expect(test_matrix.cells).toHaveLength(expected_cell_count);
  });
});