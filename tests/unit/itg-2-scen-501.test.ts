import { generateNutritionVerificationReport } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-501
  test('検証結果レポート生成 - 栄養基準ロジック検証の定量的結果をレポートに集計する', () => {
    // ========== 入力 ( 過去30日間、複数栄養項目の検証対象 ) ==========
    const verification_period_start = new Date('2024-12-01T00:00:00Z');
    const verification_period_end = new Date('2024-12-31T23:59:59Z');
    const target_nutrients = ['calorie', 'protein', 'fat', 'carbohydrate'];
    const verification_records = [
      // カロリー: 10件データ（合格8, 不合格2）
      { nutrient_id: 'calorie', user_id: 'user_001', record_date: new Date('2024-12-15T12:00:00Z'), target_value: 2000, actual_value: 1950, status: 'pass' },
      { nutrient_id: 'calorie', user_id: 'user_002', record_date: new Date('2024-12-16T12:00:00Z'), target_value: 2000, actual_value: 1920, status: 'pass' },
      { nutrient_id: 'calorie', user_id: 'user_003', record_date: new Date('2024-12-17T12:00:00Z'), target_value: 2000, actual_value: 2100, status: 'fail' },
      { nutrient_id: 'calorie', user_id: 'user_004', record_date: new Date('2024-12-18T12:00:00Z'), target_value: 2000, actual_value: 1880, status: 'pass' },
      { nutrient_id: 'calorie', user_id: 'user_005', record_date: new Date('2024-12-19T12:00:00Z'), target_value: 2000, actual_value: 2250, status: 'fail' },
      { nutrient_id: 'calorie', user_id: 'user_006', record_date: new Date('2024-12-20T12:00:00Z'), target_value: 2000, actual_value: 1950, status: 'pass' },
      { nutrient_id: 'calorie', user_id: 'user_007', record_date: new Date('2024-12-21T12:00:00Z'), target_value: 2000, actual_value: 1970, status: 'pass' },
      { nutrient_id: 'calorie', user_id: 'user_008', record_date: new Date('2024-12-22T12:00:00Z'), target_value: 2000, actual_value: 2000, status: 'pass' },
      // タンパク質: 8件データ（合格6, 不合格2）
      { nutrient_id: 'protein', user_id: 'user_001', record_date: new Date('2024-12-15T12:00:00Z'), target_value: 60, actual_value: 58, status: 'pass' },
      { nutrient_id: 'protein', user_id: 'user_002', record_date: new Date('2024-12-16T12:00:00Z'), target_value: 60, actual_value: 55, status: 'pass' },
      { nutrient_id: 'protein', user_id: 'user_003', record_date: new Date('2024-12-17T12:00:00Z'), target_value: 60, actual_value: 48, status: 'fail' },
      { nutrient_id: 'protein', user_id: 'user_004', record_date: new Date('2024-12-18T12:00:00Z'), target_value: 60, actual_value: 62, status: 'pass' },
      { nutrient_id: 'protein', user_id: 'user_005', record_date: new Date('2024-12-19T12:00:00Z'), target_value: 60, actual_value: 45, status: 'fail' },
      { nutrient_id: 'protein', user_id: 'user_006', record_date: new Date('2024-12-20T12:00:00Z'), target_value: 60, actual_value: 60, status: 'pass' },
      { nutrient_id: 'protein', user_id: 'user_007', record_date: new Date('2024-12-21T12:00:00Z'), target_value: 60, actual_value: 59, status: 'pass' },
      // 脂質: 6件データ（合格5, 不合格1）
      { nutrient_id: 'fat', user_id: 'user_001', record_date: new Date('2024-12-15T12:00:00Z'), target_value: 60, actual_value: 55, status: 'pass' },
      { nutrient_id: 'fat', user_id: 'user_002', record_date: new Date('2024-12-16T12:00:00Z'), target_value: 60, actual_value: 58, status: 'pass' },
      { nutrient_id: 'fat', user_id: 'user_003', record_date: new Date('2024-12-17T12:00:00Z'), target_value: 60, actual_value: 72, status: 'fail' },
      { nutrient_id: 'fat', user_id: 'user_004', record_date: new Date('2024-12-18T12:00:00Z'), target_value: 60, actual_value: 59, status: 'pass' },
      { nutrient_id: 'fat', user_id: 'user_005', record_date: new Date('2024-12-19T12:00:00Z'), target_value: 60, actual_value: 61, status: 'pass' },
      // 炭水化物: 7件データ（合格5, 不合格2）
      { nutrient_id: 'carbohydrate', user_id: 'user_001', record_date: new Date('2024-12-15T12:00:00Z'), target_value: 300, actual_value: 280, status: 'pass' },
      { nutrient_id: 'carbohydrate', user_id: 'user_002', record_date: new Date('2024-12-16T12:00:00Z'), target_value: 300, actual_value: 310, status: 'fail' },
      { nutrient_id: 'carbohydrate', user_id: 'user_003', record_date: new Date('2024-12-17T12:00:00Z'), target_value: 300, actual_value: 290, status: 'pass' },
      { nutrient_id: 'carbohydrate', user_id: 'user_004', record_date: new Date('2024-12-18T12:00:00Z'), target_value: 300, actual_value: 300, status: 'pass' },
      { nutrient_id: 'carbohydrate', user_id: 'user_005', record_date: new Date('2024-12-19T12:00:00Z'), target_value: 300, actual_value: 330, status: 'fail' },
      { nutrient_id: 'carbohydrate', user_id: 'user_006', record_date: new Date('2024-12-20T12:00:00Z'), target_value: 300, actual_value: 275, status: 'pass' },
    ];
    const verifier_name = '栄養士太郎';
    const report_generated_at = new Date('2024-12-31T10:30:00Z');

    // ========== レポート生成関数呼び出し ==========
    const report = generateNutritionVerificationReport({
      verification_period_start,
      verification_period_end,
      target_nutrients,
      verification_records,
      verifier_name,
      report_generated_at,
    });

    // ========== 集計値の期待値計算 ==========
    // 総検証件数: 31件（8 + 8 + 6 + 7 + 2 = 31）
    const total_records = 31;
    
    // カロリー: 10件（合格8, 不合格2, 合格率: 80.0%）
    const calorie_total = 10;
    const calorie_pass = 8;
    const calorie_fail = 2;
    const calorie_pass_rate = 80.0;

    // タンパク質: 8件（合格6, 不合格2, 合格率: 75.0%）
    const protein_total = 8;
    const protein_pass = 6;
    const protein_fail = 2;
    const protein_pass_rate = 75.0;

    // 脂質: 6件（合格5, 不合格1, 合格率: 83.3%）
    const fat_total = 6;
    const fat_pass = 5;
    const fat_fail = 1;
    const fat_pass_rate = 83.33;

    // 炭水化物: 7件（合格5, 不合格2, 合格率: 71.4%）
    const carbohydrate_total = 7;
    const carbohydrate_pass = 5;
    const carbohydrate_fail = 2;
    const carbohydrate_pass_rate = 71.43;

    // ========== Assertion: レポート基本情報 ==========
    expect(report.report_id).toBeDefined();
    expect(typeof report.report_id).toBe('string');
    expect(report.verification_period_start).toEqual(verification_period_start);
    expect(report.verification_period_end).toEqual(verification_period_end);
    expect(report.verifier_name).toBe('栄養士太郎');
    expect(report.report_generated_at).toEqual(report_generated_at);

    // ========== Assertion: 集計合計の検証 ==========
    expect(report.total_verification_records).toBe(total_records);
    expect(report.total_pass_records).toBe(calorie_pass + protein_pass + fat_pass + carbohydrate_pass);
    expect(report.total_fail_records).toBe(calorie_fail + protein_fail + fat_fail + carbohydrate_fail);

    // ========== Assertion: 栄養項目ごとの検証結果 ==========
    // カロリー
    const calorie_result = report.nutrition_item_results.find((item) => item.nutrient_id === 'calorie');
    expect(calorie_result).toBeDefined();
    expect(calorie_result!.verification_count).toBe(calorie_total);
    expect(calorie_result!.pass_count).toBe(calorie_pass);
    expect(calorie_result!.fail_count).toBe(calorie_fail);
    expect(calorie_result!.pass_rate).toBe(calorie_pass_rate);

    // タンパク質
    const protein_result = report.nutrition_item_results.find((item) => item.nutrient_id === 'protein');
    expect(protein_result).toBeDefined();
    expect(protein_result!.verification_count).toBe(protein_total);
    expect(protein_result!.pass_count).toBe(protein_pass);
    expect(protein_result!.fail_count).toBe(protein_fail);
    expect(protein_result!.pass_rate).toBe(protein_pass_rate);

    // 脂質
    const fat_result = report.nutrition_item_results.find((item) => item.nutrient_id === 'fat');
    expect(fat_result).toBeDefined();
    expect(fat_result!.verification_count).toBe(fat_total);
    expect(fat_result!.pass_count).toBe(fat_pass);
    expect(fat_result!.fail_count).toBe(fat_fail);
    expect(Number(fat_result!.pass_rate.toFixed(2))).toBe(fat_pass_rate);

    // 炭水化物
    const carbohydrate_result = report.nutrition_item_results.find((item) => item.nutrient_id === 'carbohydrate');
    expect(carbohydrate_result).toBeDefined();
    expect(carbohydrate_result!.verification_count).toBe(carbohydrate_total);
    expect(carbohydrate_result!.pass_count).toBe(carbohydrate_pass);
    expect(carbohydrate_result!.fail_count).toBe(carbohydrate_fail);
    expect(Number(carbohydrate_result!.pass_rate.toFixed(2))).toBe(carbohydrate_pass_rate);

    // ========== Assertion: 集計合計の整合性確認 ==========
    const sum_verification_count = report.nutrition_item_results.reduce((sum, item) => sum + item.verification_count, 0);
    const sum_pass_count = report.nutrition_item_results.reduce((sum, item) => sum + item.pass_count, 0);
    const sum_fail_count = report.nutrition_item_results.reduce((sum, item) => sum + item.fail_count, 0);
    expect(sum_verification_count).toBe(total_records);
    expect(sum_pass_count).toBe(report.total_pass_records);
    expect(sum_fail_count).toBe(report.total_fail_records);

    // ========== Assertion: PDF出力フォーマット ==========
    expect(report.report_format).toBe('pdf');
    expect(report.pdf_download_url).toBeDefined();
    expect(typeof report.pdf_download_url).toBe('string');
    expect(report.pdf_download_url.length).toBeGreaterThan(0);

    // ========== Assertion: 数値フォーマットの統一性 ==========
    // すべての合格率は小数第2位まで
    report.nutrition_item_results.forEach((item) => {
      const pass_rate_str = item.pass_rate.toString();
      const decimal_places = pass_rate_str.includes('.') ? pass_rate_str.split('.')[1].length : 0;
      expect(decimal_places).toBeLessThanOrEqual(2);
    });

    // ========== Assertion: レポート出力内容の検証 ==========
    expect(report.summary).toBeDefined();
    expect(report.summary.length).toBeGreaterThan(0);
    expect(report.summary).toContain('栄養基準ロジック検証');
  });
});