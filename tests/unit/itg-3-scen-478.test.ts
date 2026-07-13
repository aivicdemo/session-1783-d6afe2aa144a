import { integrateMenuRuleWithSeasonalPatternAndPricing } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-478
  test('販売期間の開始日と終了日が同一の場合、ルール統合処理が正常に完了する', () => {
    // Arrange
    const sale_start_date = new Date('2024-01-15T00:00:00Z');
    const sale_end_date = new Date('2024-01-15T00:00:00Z');
    
    const rule_integration_input = {
      seasonal_pattern_id: 'SEA-001',
      seasonal_pattern_name: '冬野菜',
      discount_rate_percent: 15,
      sale_start_date: sale_start_date,
      sale_end_date: sale_end_date,
      priority_score: 85
    };

    // Act
    const result = integrateMenuRuleWithSeasonalPatternAndPricing(rule_integration_input);

    // Assert - 統合処理のステータスを確認
    expect(result.integration_status).toBe('completed');

    // Assert - エラーが発生していないことを確認
    expect(result.error_code).toBeNull();
    expect(result.error_message).toBeNull();

    // Assert - 統合ルール情報の開始日と終了日が同一日付で保持されているか検証
    expect(result.integrated_rule.sale_start_date).toEqual(sale_start_date);
    expect(result.integrated_rule.sale_end_date).toEqual(sale_end_date);

    // Assert - 開始日と終了日が同一であることを確認
    expect(result.integrated_rule.sale_start_date.getTime()).toBe(
      result.integrated_rule.sale_end_date.getTime()
    );

    // Assert - 季節パターンの情報が正確に反映されているか確認
    expect(result.integrated_rule.seasonal_pattern_id).toBe('SEA-001');
    expect(result.integrated_rule.seasonal_pattern_name).toBe('冬野菜');

    // Assert - 割引率の情報が正確に反映されているか確認
    expect(result.integrated_rule.discount_rate_percent).toBe(15);

    // Assert - 優先度スコアが保持されているか確認
    expect(result.integrated_rule.priority_score).toBe(85);

    // Assert - 統合ルール適用時の販売期間条件判定が正常に動作することを確認
    const test_date = new Date('2024-01-15T12:00:00Z');
    const is_date_within_sale_period = result.integrated_rule.sale_start_date <= test_date &&
                                       test_date <= result.integrated_rule.sale_end_date;
    expect(is_date_within_sale_period).toBe(true);

    // Assert - 販売期間が1日間（開始日と終了日が同一）であることを数値で検証
    const sale_period_days = Math.floor(
      (result.integrated_rule.sale_end_date.getTime() - result.integrated_rule.sale_start_date.getTime()) /
      (1000 * 60 * 60 * 24)
    );
    expect(sale_period_days).toBe(0);

    // Assert - 統合ルールオブジェクトが完全に構築されていることを確認
    expect(result.integrated_rule).toHaveProperty('seasonal_pattern_id');
    expect(result.integrated_rule).toHaveProperty('seasonal_pattern_name');
    expect(result.integrated_rule).toHaveProperty('discount_rate_percent');
    expect(result.integrated_rule).toHaveProperty('sale_start_date');
    expect(result.integrated_rule).toHaveProperty('sale_end_date');
    expect(result.integrated_rule).toHaveProperty('priority_score');

    // Assert - 統合ルールIDが生成されていることを確認
    expect(result.integrated_rule.rule_id).toBeDefined();
    expect(typeof result.integrated_rule.rule_id).toBe('string');
    expect(result.integrated_rule.rule_id.length).toBeGreaterThan(0);

    // Assert - 統合完了時刻がタイムスタンプとして記録されていることを確認
    expect(result.integration_completed_at).toBeDefined();
    expect(result.integration_completed_at instanceof Date).toBe(true);
  });
});