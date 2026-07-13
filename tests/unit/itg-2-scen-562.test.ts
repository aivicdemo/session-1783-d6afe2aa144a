import { filterAnomalousAndMissingValues } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データ自動集計・ダッシュボード機能', () => {
  // SCEN-562: [error] 異常値・欠損値自動フィルタリング機能 - フィルタリング処理中に予期しないデータ型が含まれている場合、エラーハンドリングが実行される
  test('予期しないデータ型が含まれている場合、エラーハンドリングが実行され、エラーログが記録され、システムが安定した状態を保つ', () => {
    // 正常なデータレコード
    const validNutritionData = {
      user_id: 'user_001',
      date: '2024-01-15',
      calorie_intake: 2100,
      protein_intake: 65.5,
      fat_intake: 58.3,
      carbohydrate_intake: 285.0,
    };

    // 予期しないデータ型を含むレコード（数値フィールドに文字列混在）
    const invalidDataWithStringInNumericField = {
      user_id: 'user_002',
      date: '2024-01-15',
      calorie_intake: 'invalid_string',
      protein_intake: 65.5,
      fat_intake: 58.3,
      carbohydrate_intake: 285.0,
    };

    // nullを含むレコード
    const invalidDataWithNull = {
      user_id: 'user_003',
      date: '2024-01-15',
      calorie_intake: null,
      protein_intake: 65.5,
      fat_intake: 58.3,
      carbohydrate_intake: 285.0,
    };

    // undefinedを含むレコード
    const invalidDataWithUndefined = {
      user_id: 'user_004',
      date: '2024-01-15',
      calorie_intake: undefined,
      protein_intake: 65.5,
      fat_intake: 58.3,
      carbohydrate_intake: 285.0,
    };

    // 混合データセット
    const mixedDataset = [
      validNutritionData,
      invalidDataWithStringInNumericField,
      invalidDataWithNull,
      invalidDataWithUndefined,
    ];

    // フィルタリング処理実行
    const result = filterAnomalousAndMissingValues(mixedDataset);

    // 期待結果: 正常なデータのみが返される
    expect(result.filtered_data).toEqual([validNutritionData]);

    // 期待結果: 除外されたレコード数が正確に記録される
    expect(result.excluded_count).toBe(3);

    // 期待結果: エラーログが記録される
    expect(result.error_log).toBeDefined();
    expect(result.error_log.length).toBe(3);

    // 期待結果: エラーログに予期しないデータ型に関する情報が含まれる
    expect(result.error_log[0]).toMatch(/データ型/);
    expect(result.error_log[1]).toMatch(/null/);
    expect(result.error_log[2]).toMatch(/undefined/);

    // 期待結果: ユーザーに表示するエラーメッセージが生成される
    expect(result.user_error_message).toBeDefined();
    expect(result.user_error_message).toMatch(/不正なデータ/);

    // 期待結果: システムが安定した状態を保つ（処理が完了し、例外がスローされない）
    expect(result.status).toBe('completed_with_errors');

    // 期待結果: フィルタリング処理は中断されず、正常データは保持される
    expect(result.filtered_data.length).toBeGreaterThan(0);
  });

  test('予期しないデータ型が含まれている場合、エラーハンドリング関数がthrowを投げる（constraints に基づく）', () => {
    // 完全に不正なデータセット
    const completelyInvalidDataset = [
      {
        user_id: null,
        date: 'invalid_date_format',
        calorie_intake: 'not_a_number',
        protein_intake: undefined,
        fat_intake: {},
        carbohydrate_intake: [],
      },
    ];

    // 関数がエラーをthrowすることを確認
    expect(() => {
      filterAnomalousAndMissingValues(completelyInvalidDataset);
    }).toThrow(/データ型エラー/);
  });

  test('混合データセットでフィルタリング実行時、除外されたレコード詳細情報が記録される', () => {
    const testDataset = [
      {
        user_id: 'user_001',
        date: '2024-01-15',
        calorie_intake: 2100,
        protein_intake: 65.5,
        fat_intake: 58.3,
        carbohydrate_intake: 285.0,
      },
      {
        user_id: 'user_002',
        date: '2024-01-16',
        calorie_intake: 'invalid',
        protein_intake: 70.0,
        fat_intake: 60.0,
        carbohydrate_intake: 300.0,
      },
    ];

    const result = filterAnomalousAndMissingValues(testDataset);

    // 期待結果: 除外されたレコードの詳細情報が記録される
    expect(result.excluded_records_detail).toBeDefined();
    expect(result.excluded_records_detail.length).toBe(1);
    expect(result.excluded_records_detail[0].user_id).toBe('user_002');
    expect(result.excluded_records_detail[0].reason).toMatch(/calorie_intake/);

    // 期待結果: エラーログの記録タイムスタンプが存在する
    expect(result.error_log_timestamp).toBeDefined();
  });

  test('正常なデータのみのセットではエラーが発生しない', () => {
    const validDataset = [
      {
        user_id: 'user_001',
        date: '2024-01-15',
        calorie_intake: 2100,
        protein_intake: 65.5,
        fat_intake: 58.3,
        carbohydrate_intake: 285.0,
      },
      {
        user_id: 'user_002',
        date: '2024-01-16',
        calorie_intake: 2300,
        protein_intake: 70.0,
        fat_intake: 62.0,
        carbohydrate_intake: 310.0,
      },
    ];

    const result = filterAnomalousAndMissingValues(validDataset);

    // 期待結果: すべてのデータが返される
    expect(result.filtered_data).toEqual(validDataset);
    expect(result.excluded_count).toBe(0);

    // 期待結果: エラーログが空である
    expect(result.error_log.length).toBe(0);

    // 期待結果: ステータスが正常完了
    expect(result.status).toBe('completed_successfully');
  });

  test('空のデータセットが入力された場合のハンドリング', () => {
    const emptyDataset: any[] = [];

    const result = filterAnomalousAndMissingValues(emptyDataset);

    // 期待結果: 空のフィルタリング結果が返される
    expect(result.filtered_data).toEqual([]);
    expect(result.excluded_count).toBe(0);
    expect(result.status).toBe('completed_successfully');
  });
});