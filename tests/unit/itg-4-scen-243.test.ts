import { filterAnomalousAndMissingValues } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：異常値・欠損値フィルタリング機能', () => {
  // SCEN-243
  test('異常値・欠損値フィルタリング機能 - 欠損値を含む栄養バランス検証結果から正常データのみを抽出できる', () => {
    // 準備: 正常データ5件と欠損値を含むデータ3件を混在させたテストデータ
    const nutrition_balance_validation_results = [
      {
        nutrition_result_id: 'NR001',
        user_id: 'USER001',
        validation_date: '2024-01-15',
        protein_g: 60.5,
        fat_g: 50.3,
        carbohydrate_g: 200.0,
        calories_kcal: 1950,
        is_valid: true,
      },
      {
        nutrition_result_id: 'NR002',
        user_id: 'USER002',
        validation_date: '2024-01-15',
        protein_g: 65.0,
        fat_g: 48.5,
        carbohydrate_g: 210.0,
        calories_kcal: 2000,
        is_valid: true,
      },
      {
        nutrition_result_id: 'NR003',
        user_id: 'USER003',
        validation_date: '2024-01-15',
        protein_g: null,
        fat_g: 52.0,
        carbohydrate_g: 195.0,
        calories_kcal: 1900,
        is_valid: false,
      },
      {
        nutrition_result_id: 'NR004',
        user_id: 'USER004',
        validation_date: '2024-01-15',
        protein_g: 58.0,
        fat_g: 51.0,
        carbohydrate_g: 205.0,
        calories_kcal: 1980,
        is_valid: true,
      },
      {
        nutrition_result_id: 'NR005',
        user_id: 'USER005',
        validation_date: '2024-01-15',
        protein_g: 62.0,
        fat_g: null,
        carbohydrate_g: 208.0,
        calories_kcal: 1970,
        is_valid: false,
      },
      {
        nutrition_result_id: 'NR006',
        user_id: 'USER006',
        validation_date: '2024-01-15',
        protein_g: 61.0,
        fat_g: 49.0,
        carbohydrate_g: 202.0,
        calories_kcal: 1960,
        is_valid: true,
      },
      {
        nutrition_result_id: 'NR007',
        user_id: 'USER007',
        validation_date: '2024-01-15',
        protein_g: 59.5,
        fat_g: 50.5,
        carbohydrate_g: null,
        calories_kcal: 1940,
        is_valid: false,
      },
      {
        nutrition_result_id: 'NR008',
        user_id: 'USER008',
        validation_date: '2024-01-15',
        protein_g: 64.0,
        fat_g: 51.5,
        carbohydrate_g: 207.0,
        calories_kcal: 1990,
        is_valid: true,
      },
    ];

    // 実行: フィルタリング処理
    const filtered_result = filterAnomalousAndMissingValues(nutrition_balance_validation_results);

    // 検証1: 抽出されたデータは5件（正常データのみ）
    expect(filtered_result.valid_records).toHaveLength(5);

    // 検証2: 除外されたデータは3件（欠損値を含むデータ）
    expect(filtered_result.filtered_out_records).toHaveLength(3);

    // 検証3: 正常データのみが抽出されていることを確認
    const valid_nutrition_ids = filtered_result.valid_records.map(
      (record: { nutrition_result_id: string }) => record.nutrition_result_id
    );
    expect(valid_nutrition_ids).toEqual(['NR001', 'NR002', 'NR004', 'NR006', 'NR008']);

    // 検証4: 除外されたデータが欠損値を含むレコードであることを確認
    const filtered_out_ids = filtered_result.filtered_out_records.map(
      (record: { nutrition_result_id: string }) => record.nutrition_result_id
    );
    expect(filtered_out_ids).toEqual(['NR003', 'NR005', 'NR007']);

    // 検証5: 抽出されたデータの栄養項目がすべて揃っていることを確認
    filtered_result.valid_records.forEach(
      (record: {
        protein_g: number;
        fat_g: number;
        carbohydrate_g: number;
        calories_kcal: number;
      }) => {
        expect(record.protein_g).not.toBeNull();
        expect(record.fat_g).not.toBeNull();
        expect(record.carbohydrate_g).not.toBeNull();
        expect(record.calories_kcal).not.toBeNull();
        expect(typeof record.protein_g).toBe('number');
        expect(typeof record.fat_g).toBe('number');
        expect(typeof record.carbohydrate_g).toBe('number');
        expect(typeof record.calories_kcal).toBe('number');
      }
    );

    // 検証6: フィルタリング結果の統計情報
    expect(filtered_result.total_input_records).toBe(8);
    expect(filtered_result.valid_records_count).toBe(5);
    expect(filtered_result.filtered_out_records_count).toBe(3);

    // 検証7: 正常データの具体的な栄養バランス値を確認
    const record_nr001 = filtered_result.valid_records.find(
      (r: { nutrition_result_id: string }) => r.nutrition_result_id === 'NR001'
    );
    expect(record_nr001.protein_g).toBe(60.5);
    expect(record_nr001.fat_g).toBe(50.3);
    expect(record_nr001.carbohydrate_g).toBe(200.0);
    expect(record_nr001.calories_kcal).toBe(1950);

    const record_nr008 = filtered_result.valid_records.find(
      (r: { nutrition_result_id: string }) => r.nutrition_result_id === 'NR008'
    );
    expect(record_nr008.protein_g).toBe(64.0);
    expect(record_nr008.fat_g).toBe(51.5);
    expect(record_nr008.carbohydrate_g).toBe(207.0);
    expect(record_nr008.calories_kcal).toBe(1990);
  });
});