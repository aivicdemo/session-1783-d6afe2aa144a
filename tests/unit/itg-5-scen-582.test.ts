import { calculateSeasonalAndDiscountPriority } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-582: [error] 旬食材・割引商品の優先度スコアリング機能 - 価格データが不完全な場合、部分的なスコアリング結果が返却される
  test('価格データが不完全な場合、部分的なスコアリング結果が返却される', () => {
    const incomplete_product_list = [
      {
        product_id: 'P001',
        product_name: '人参',
        is_seasonal: true,
        discount_rate: 0.15,
        price: 120,
        season_score: 85,
      },
      {
        product_id: 'P002',
        product_name: 'トマト',
        is_seasonal: true,
        discount_rate: 0.20,
        price: undefined,
        season_score: 90,
      },
      {
        product_id: 'P003',
        product_name: 'キャベツ',
        is_seasonal: false,
        discount_rate: 0.0,
        price: 150,
        season_score: 0,
      },
      {
        product_id: 'P004',
        product_name: 'ブロッコリー',
        is_seasonal: true,
        discount_rate: 0.10,
        price: null,
        season_score: 75,
      },
    ];

    const result = calculateSeasonalAndDiscountPriority(incomplete_product_list);

    expect(result.processed_count).toBe(2);
    expect(result.skipped_count).toBe(2);
    expect(result.total_count).toBe(4);

    expect(result.scored_products).toHaveLength(2);

    const scored_P001 = result.scored_products.find((p) => p.product_id === 'P001');
    expect(scored_P001).toBeDefined();
    expect(scored_P001?.priority_score).toBe(85);
    expect(scored_P001?.price).toBe(120);
    expect(scored_P001?.discount_rate).toBe(0.15);

    const scored_P003 = result.scored_products.find((p) => p.product_id === 'P003');
    expect(scored_P003).toBeDefined();
    expect(scored_P003?.priority_score).toBe(0);
    expect(scored_P003?.price).toBe(150);

    expect(result.skipped_products).toHaveLength(2);

    const skipped_P002 = result.skipped_products.find(
      (p) => p.product_id === 'P002',
    );
    expect(skipped_P002).toBeDefined();
    expect(skipped_P002?.reason).toBe('price_missing');

    const skipped_P004 = result.skipped_products.find(
      (p) => p.product_id === 'P004',
    );
    expect(skipped_P004).toBeDefined();
    expect(skipped_P004?.reason).toBe('price_missing');

    expect(result.warnings).toHaveLength(2);
    expect(result.warnings[0]).toMatch(/price_missing/);
    expect(result.warnings[1]).toMatch(/price_missing/);

    expect(result.is_partial_result).toBe(true);
    expect(result.data_quality_score).toBe(50);
  });
});