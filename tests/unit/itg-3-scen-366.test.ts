import { calculateMenuOptimizationScores } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-366: 流通業者在庫・価格データ連携による献立最適化機能 - 複数献立案に対して旬・割引・在庫充足度のスコアが正しく付与される
  test('複数献立案に対して旬度スコア・割引スコア・在庫充足度スコアが正確に計算され、総合スコアでランキング表示される', () => {
    // ===== Setup: 複数献立案と流通業者の在庫・価格データを準備 =====
    const menu_proposal_1 = {
      menu_id: 'menu_001',
      menu_name: '旬の野菜炒め定食',
      ingredients: [
        { ingredient_id: 'ing_001', ingredient_name: 'キャベツ', quantity: 200, season_relevance: 0.95, in_season: true },
        { ingredient_id: 'ing_002', ingredient_name: '豚肉', quantity: 150, season_relevance: 0.70, in_season: false },
        { ingredient_id: 'ing_003', ingredient_name: 'ニンジン', quantity: 100, season_relevance: 0.85, in_season: true }
      ]
    };

    const menu_proposal_2 = {
      menu_id: 'menu_002',
      menu_name: '割引食材を使った麺類',
      ingredients: [
        { ingredient_id: 'ing_004', ingredient_name: 'うどん', quantity: 200, season_relevance: 0.50, in_season: false },
        { ingredient_id: 'ing_005', ingredient_name: 'キャベツ', quantity: 150, season_relevance: 0.95, in_season: true },
        { ingredient_id: 'ing_001', ingredient_name: 'ニンジン', quantity: 80, season_relevance: 0.85, in_season: true }
      ]
    };

    const menu_proposal_3 = {
      menu_id: 'menu_003',
      menu_name: '在庫充足度が高い献立',
      ingredients: [
        { ingredient_id: 'ing_006', ingredient_name: 'トマト', quantity: 300, season_relevance: 0.60, in_season: false },
        { ingredient_id: 'ing_007', ingredient_name: '玉ねぎ', quantity: 200, season_relevance: 0.70, in_season: false },
        { ingredient_id: 'ing_008', ingredient_name: '鶏肉', quantity: 200, season_relevance: 0.65, in_season: false }
      ]
    };

    const inventory_price_data = {
      ing_001: { distributor: '食材卸A', current_inventory: 500, max_inventory: 1000, inventory_satisfaction: 0.50, unit_price: 120, discount_rate: 0.15, is_in_season: true },
      ing_002: { distributor: '食材卸A', current_inventory: 300, max_inventory: 1000, inventory_satisfaction: 0.30, unit_price: 800, discount_rate: 0.05, is_in_season: false },
      ing_003: { distributor: '食材卸A', current_inventory: 600, max_inventory: 800, inventory_satisfaction: 0.75, unit_price: 150, discount_rate: 0.10, is_in_season: true },
      ing_004: { distributor: '食材卸B', current_inventory: 2000, max_inventory: 2000, inventory_satisfaction: 1.00, unit_price: 200, discount_rate: 0.00, is_in_season: false },
      ing_005: { distributor: '食材卸B', current_inventory: 800, max_inventory: 1000, inventory_satisfaction: 0.80, unit_price: 100, discount_rate: 0.20, is_in_season: true },
      ing_006: { distributor: '食材卸C', current_inventory: 1200, max_inventory: 1200, inventory_satisfaction: 1.00, unit_price: 180, discount_rate: 0.00, is_in_season: false },
      ing_007: { distributor: '食材卸C', current_inventory: 950, max_inventory: 1000, inventory_satisfaction: 0.95, unit_price: 140, discount_rate: 0.08, is_in_season: false },
      ing_008: { distributor: '食材卸C', current_inventory: 1100, max_inventory: 1200, inventory_satisfaction: 0.92, unit_price: 900, discount_rate: 0.12, is_in_season: false }
    };

    // ===== 実行: 複数献立案に対してスコア計算を実行 =====
    const result = calculateMenuOptimizationScores({
      menu_proposals: [menu_proposal_1, menu_proposal_2, menu_proposal_3],
      inventory_price_data: inventory_price_data
    });

    // ===== 検証: 旬度スコア（Seasonality Score）の検証 =====
    // menu_proposal_1: (0.95 + 0.70 + 0.85) / 3 = 2.50 / 3 = 0.8333 * 100 = 83.33
    expect(result.scores[0].seasonality_score).toBe(83.33);
    // menu_proposal_2: (0.50 + 0.95 + 0.85) / 3 = 2.30 / 3 = 0.7667 * 100 = 76.67
    expect(result.scores[1].seasonality_score).toBe(76.67);
    // menu_proposal_3: (0.60 + 0.70 + 0.65) / 3 = 1.95 / 3 = 0.6500 * 100 = 65.00
    expect(result.scores[2].seasonality_score).toBe(65.00);

    // ===== 検証: 割引スコア（Discount Score）の検証 =====
    // menu_proposal_1: (0.15 + 0.05 + 0.10) / 3 = 0.30 / 3 = 0.10 * 100 = 10.00
    expect(result.scores[0].discount_score).toBe(10.00);
    // menu_proposal_2: (0.00 + 0.20 + 0.10) / 3 = 0.30 / 3 = 0.10 * 100 = 10.00
    expect(result.scores[1].discount_score).toBe(10.00);
    // menu_proposal_3: (0.00 + 0.08 + 0.12) / 3 = 0.20 / 3 = 0.0667 * 100 = 6.67
    expect(result.scores[2].discount_score).toBe(6.67);

    // ===== 検証: 在庫充足度スコア（Inventory Satisfaction Score）の検証 =====
    // menu_proposal_1: (0.50 + 0.30 + 0.75) / 3 = 1.55 / 3 = 0.5167 * 100 = 51.67
    expect(result.scores[0].inventory_satisfaction_score).toBe(51.67);
    // menu_proposal_2: (1.00 + 0.80 + 0.75) / 3 = 2.55 / 3 = 0.8500 * 100 = 85.00
    expect(result.scores[1].inventory_satisfaction_score).toBe(85.00);
    // menu_proposal_3: (1.00 + 0.95 + 0.92) / 3 = 2.87 / 3 = 0.9567 * 100 = 95.67
    expect(result.scores[2].inventory_satisfaction_score).toBe(95.67);

    // ===== 検証: 総合スコア（Combined Score）の検証 =====
    // 総合スコア = (旬度スコア * 0.35 + 割引スコア * 0.25 + 在庫充足度スコア * 0.40) / 1.00
    // menu_proposal_1: (83.33 * 0.35 + 10.00 * 0.25 + 51.67 * 0.40) = 29.1655 + 2.5 + 20.668 = 52.3335
    expect(result.scores[0].combined_score).toBe(52.33);
    // menu_proposal_2: (76.67 * 0.35 + 10.00 * 0.25 + 85.00 * 0.40) = 26.8345 + 2.5 + 34.0 = 63.3345
    expect(result.scores[1].combined_score).toBe(63.33);
    // menu_proposal_3: (65.00 * 0.35 + 6.67 * 0.25 + 95.67 * 0.40) = 22.75 + 1.6675 + 38.268 = 62.6855
    expect(result.scores[2].combined_score).toBe(62.69);

    // ===== 検証: スコアが0～100の範囲内であること =====
    result.scores.forEach((score) => {
      expect(score.seasonality_score).toBeGreaterThanOrEqual(0);
      expect(score.seasonality_score).toBeLessThanOrEqual(100);
      expect(score.discount_score).toBeGreaterThanOrEqual(0);
      expect(score.discount_score).toBeLessThanOrEqual(100);
      expect(score.inventory_satisfaction_score).toBeGreaterThanOrEqual(0);
      expect(score.inventory_satisfaction_score).toBeLessThanOrEqual(100);
      expect(score.combined_score).toBeGreaterThanOrEqual(0);
      expect(score.combined_score).toBeLessThanOrEqual(100);
    });

    // ===== 検証: ランキング順序の検証（総合スコアの高い順） =====
    expect(result.ranking[0].menu_id).toBe('menu_002');
    expect(result.ranking[0].combined_score).toBe(63.33);
    expect(result.ranking[1].menu_id).toBe('menu_003');
    expect(result.ranking[1].combined_score).toBe(62.69);
    expect(result.ranking[2].menu_id).toBe('menu_001');
    expect(result.ranking[2].combined_score).toBe(52.33);

    // ===== 検証: ランキング配列の長さが献立案数と一致 =====
    expect(result.ranking.length).toBe(3);

    // ===== 検証: メタデータ検証 =====
    expect(result.optimization_timestamp).toBeDefined();
    expect(result.data_source_count).toBe(3);
    expect(result.calculation_method).toBe('weighted_average');
    expect(result.weighting_factors).toEqual({
      seasonality_weight: 0.35,
      discount_weight: 0.25,
      inventory_satisfaction_weight: 0.40
    });
  });
});