import {
  extractDemandPredictionDataUnifiedFormat,
} from '../../src/logic/it-2-br-6-3-2';

describe('外部データと実績需要の相関分析・変数抽出機能', () => {
  // SCEN-259: [normal] 需要予測データ統一フォーマット抽出機能 - 指定期間の献立提案データを統一フォーマットで抽出できる
  test('指定期間の献立提案データが統一フォーマットで正常に抽出される', () => {
    const start_date = '2024-01-01';
    const end_date = '2024-01-31';
    const data_source = 'menu_proposal';
    const output_format = 'unified';

    const extract_result = extractDemandPredictionDataUnifiedFormat({
      start_date,
      end_date,
      data_source,
      output_format,
    });

    // 抽出結果が配列であること
    expect(Array.isArray(extract_result.data)).toBe(true);

    // 抽出データの件数が正の整数であること
    expect(extract_result.record_count).toBe(31);

    // 各レコードが必須フィールドをすべて含むこと
    extract_result.data.forEach((record: any) => {
      expect(record).toHaveProperty('date');
      expect(record).toHaveProperty('menu_name');
      expect(record).toHaveProperty('ingredient_name');
      expect(record).toHaveProperty('quantity');
      expect(record).toHaveProperty('unit_price');
    });

    // 日付フィールドが ISO 8601 形式であること
    extract_result.data.forEach((record: any) => {
      expect(/^\d{4}-\d{2}-\d{2}$/.test(record.date)).toBe(true);
    });

    // 数量が正の数値であること
    extract_result.data.forEach((record: any) => {
      expect(typeof record.quantity).toBe('number');
      expect(record.quantity).toBeGreaterThan(0);
    });

    // 単価が正の数値であること
    extract_result.data.forEach((record: any) => {
      expect(typeof record.unit_price).toBe('number');
      expect(record.unit_price).toBeGreaterThan(0);
    });

    // 献立名が文字列であること
    extract_result.data.forEach((record: any) => {
      expect(typeof record.menu_name).toBe('string');
      expect(record.menu_name.length).toBeGreaterThan(0);
    });

    // 食材名が文字列であること
    extract_result.data.forEach((record: any) => {
      expect(typeof record.ingredient_name).toBe('string');
      expect(record.ingredient_name.length).toBeGreaterThan(0);
    });

    // 重複データがないこと（date + menu_name + ingredient_name の複合キーが一意）
    const record_keys = extract_result.data.map(
      (record: any) => `${record.date}|${record.menu_name}|${record.ingredient_name}`
    );
    const unique_keys = new Set(record_keys);
    expect(unique_keys.size).toBe(extract_result.record_count);

    // 指定期間内のデータのみであること
    extract_result.data.forEach((record: any) => {
      const record_date = new Date(record.date);
      const start = new Date(start_date);
      const end = new Date(end_date);
      expect(record_date.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(record_date.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    // 出力フォーマットが統一フォーマット規格に準拠していること
    expect(extract_result.format).toBe('unified');
    expect(extract_result.schema_version).toBe('1.0');

    // 抽出成功ステータスであること
    expect(extract_result.status).toBe('success');
  });
});