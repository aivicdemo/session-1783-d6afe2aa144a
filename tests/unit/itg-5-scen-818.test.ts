import { integrateDiscountRules } from '../../src/logic/it-7-2-1';

describe('季節パターン・割引率・販売期間ルール統合機能', () => {
  test('SCEN-818: 割引率閾値が0%または100%の境界値である場合、ルール統合時に正しく処理される', () => {
    // 前提: 割引率0%と100%のルールが定義され、季節パターンと販売期間ルールが存在する
    const rule_0_percent = {
      rule_id: 'rule_001',
      discount_rate: 0,
      seasonal_pattern: 'spring',
      sales_period_start: '2024-03-01',
      sales_period_end: '2024-05-31',
      priority_score: 50,
    };

    const rule_100_percent = {
      rule_id: 'rule_002',
      discount_rate: 100,
      seasonal_pattern: 'winter',
      sales_period_start: '2024-12-01',
      sales_period_end: '2024-12-31',
      priority_score: 80,
    };

    const rule_seasonal = {
      rule_id: 'rule_003',
      discount_rate: 30,
      seasonal_pattern: 'summer',
      sales_period_start: '2024-06-01',
      sales_period_end: '2024-08-31',
      priority_score: 60,
    };

    // テスト入力: 複数ルールを統合する
    const integration_request = {
      rules: [rule_0_percent, rule_100_percent, rule_seasonal],
      integration_timestamp: '2024-01-15T11:00:00Z',
      target_user_segment: 'busy_househusband',
    };

    // 実行: ルール統合処理
    const result = integrateDiscountRules(integration_request);

    // 期待結果の検証

    // 1. 統合されたルールが存在し、配列形式であること
    expect(Array.isArray(result.integrated_rules)).toBe(true);
    expect(result.integrated_rules.length).toBe(3);

    // 2. 割引率0%のルールが正しく処理されている
    const rule_0_result = result.integrated_rules.find(
      (r: any) => r.rule_id === 'rule_001'
    );
    expect(rule_0_result).toBeDefined();
    expect(rule_0_result.discount_rate).toBe(0);
    expect(typeof rule_0_result.discount_rate).toBe('number');
    expect(rule_0_result.seasonal_pattern).toBe('spring');
    expect(rule_0_result.sales_period_start).toBe('2024-03-01');
    expect(rule_0_result.sales_period_end).toBe('2024-05-31');

    // 3. 割引率100%のルールが正しく処理されている
    const rule_100_result = result.integrated_rules.find(
      (r: any) => r.rule_id === 'rule_002'
    );
    expect(rule_100_result).toBeDefined();
    expect(rule_100_result.discount_rate).toBe(100);
    expect(typeof rule_100_result.discount_rate).toBe('number');
    expect(rule_100_result.seasonal_pattern).toBe('winter');
    expect(rule_100_result.sales_period_start).toBe('2024-12-01');
    expect(rule_100_result.sales_period_end).toBe('2024-12-31');

    // 4. 通常の割引率ルール（30%）も正しく処理されている
    const rule_30_result = result.integrated_rules.find(
      (r: any) => r.rule_id === 'rule_003'
    );
    expect(rule_30_result).toBeDefined();
    expect(rule_30_result.discount_rate).toBe(30);

    // 5. 数値精度が保たれていることを検証
    expect(rule_0_result.discount_rate).toStrictEqual(0);
    expect(rule_100_result.discount_rate).toStrictEqual(100);
    expect(rule_30_result.discount_rate).toStrictEqual(30);

    // 6. 割引適用計算の検証（0%割引の場合、元価の100%が適用される）
    const base_price = 1000;
    const discounted_price_0 = base_price * (1 - rule_0_result.discount_rate / 100);
    expect(discounted_price_0).toBe(1000);

    // 7. 割引適用計算の検証（100%割引の場合、元価の0%が適用される）
    const discounted_price_100 =
      base_price * (1 - rule_100_result.discount_rate / 100);
    expect(discounted_price_100).toBe(0);

    // 8. 割引適用計算の検証（30%割引の場合、元価の70%が適用される）
    const discounted_price_30 =
      base_price * (1 - rule_30_result.discount_rate / 100);
    expect(discounted_price_30).toBe(700);

    // 9. 統合ルール全体の優先度順序が保持されている
    const priority_sequence = result.integrated_rules.map((r: any) => r.priority_score);
    expect(priority_sequence).toEqual([50, 80, 60]);

    // 10. 統合メタデータが正しく記録されている
    expect(result.integration_timestamp).toBe('2024-01-15T11:00:00Z');
    expect(result.target_user_segment).toBe('busy_househusband');
    expect(result.integration_status).toBe('success');

    // 11. 統合ルール内に矛盾がないことを検証
    const seasonal_patterns = new Set(
      result.integrated_rules.map((r: any) => r.seasonal_pattern)
    );
    expect(seasonal_patterns.size).toBe(3); // 重複がない

    // 12. 販売期間の整合性検証
    result.integrated_rules.forEach((rule: any) => {
      const start = new Date(rule.sales_period_start);
      const end = new Date(rule.sales_period_end);
      expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    // 13. 統合されたルールの総数が入力と一致
    expect(result.integrated_rules.length).toBe(
      integration_request.rules.length
    );

    // 14. 各ルールのID一致性確認
    const result_ids = result.integrated_rules.map((r: any) => r.rule_id).sort();
    const expected_ids = ['rule_001', 'rule_002', 'rule_003'].sort();
    expect(result_ids).toEqual(expected_ids);
  });
});