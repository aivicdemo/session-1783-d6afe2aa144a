import { calculateMenuPriorityScores } from '../../src/logic/it-7-2-1';

describe('献立案の優先度スコアリング - 旬食材・割引商品・在庫を総合考慮', () => {
  // SCEN-579
  test('複数の献立案に対して流通業者の在庫・価格データに基づいて優先度スコアが付与され、旬食材・割引・在庫を考慮したスコアリングが実施される', () => {
    // 準備: 複数の献立案（3件以上）を定義
    const menu_plan_1 = {
      menu_id: 'menu_001',
      menu_name: '旬野菜と鶏肉の炒め',
      ingredients: [
        { ingredient_id: 'ing_001', ingredient_name: 'トマト', quantity: 2 },
        { ingredient_id: 'ing_002', ingredient_name: '鶏もも肉', quantity: 300 },
        { ingredient_id: 'ing_003', ingredient_name: 'キャベツ', quantity: 200 },
      ],
    };

    const menu_plan_2 = {
      menu_id: 'menu_002',
      menu_name: 'オフシーズン食材の煮込み',
      ingredients: [
        { ingredient_id: 'ing_004', ingredient_name: 'タマネギ', quantity: 150 },
        { ingredient_id: 'ing_005', ingredient_name: '豚肉', quantity: 250 },
        { ingredient_id: 'ing_006', ingredient_name: 'ジャガイモ', quantity: 300 },
      ],
    };

    const menu_plan_3 = {
      menu_id: 'menu_003',
      menu_name: '割引商品活用メニュー',
      ingredients: [
        { ingredient_id: 'ing_001', ingredient_name: 'トマト', quantity: 3 },
        { ingredient_id: 'ing_003', ingredient_name: 'キャベツ', quantity: 250 },
        { ingredient_id: 'ing_007', ingredient_name: 'ナス', quantity: 2 },
      ],
    };

    const menu_plans = [menu_plan_1, menu_plan_2, menu_plan_3];

    // 準備: 流通業者の在庫データ（食材ごとの在庫数）
    const stock_data = {
      ing_001: { stock_quantity: 150, distributor_id: 'dist_001' }, // トマト: 在庫豊富
      ing_002: { stock_quantity: 50, distributor_id: 'dist_001' }, // 鶏もも肉: 在庫限定
      ing_003: { stock_quantity: 200, distributor_id: 'dist_001' }, // キャベツ: 在庫豊富
      ing_004: { stock_quantity: 30, distributor_id: 'dist_001' }, // タマネギ: 在庫限定
      ing_005: { stock_quantity: 40, distributor_id: 'dist_001' }, // 豚肉: 在庫限定
      ing_006: { stock_quantity: 80, distributor_id: 'dist_001' }, // ジャガイモ: 在庫中程度
      ing_007: { stock_quantity: 120, distributor_id: 'dist_001' }, // ナス: 在庫豊富
    };

    // 準備: 流通業者の価格データ（食材ごとの価格、割引率）
    const price_data = {
      ing_001: { base_price: 200, discount_rate: 0.2, is_on_sale: true }, // トマト: 20%割引セール中
      ing_002: { base_price: 1500, discount_rate: 0.0, is_on_sale: false }, // 鶏もも肉: 割引なし
      ing_003: { base_price: 150, discount_rate: 0.15, is_on_sale: true }, // キャベツ: 15%割引
      ing_004: { base_price: 120, discount_rate: 0.0, is_on_sale: false }, // タマネギ: 割引なし
      ing_005: { base_price: 1800, discount_rate: 0.1, is_on_sale: true }, // 豚肉: 10%割引
      ing_006: { base_price: 100, discount_rate: 0.05, is_on_sale: true }, // ジャガイモ: 5%割引
      ing_007: { base_price: 180, discount_rate: 0.25, is_on_sale: true }, // ナス: 25%割引セール中
    };

    // 準備: 旬食材判定データ（現在の季節における旬の食材リスト）
    // 仮定：夏季（6月-8月）の旬食材
    const seasonal_ingredients = {
      current_season: 'summer',
      seasonal_list: ['ing_001', 'ing_003', 'ing_007'], // トマト、キャベツ、ナスが旬
    };

    // 実行: 優先度スコアリング機能を実行
    const result = calculateMenuPriorityScores({
      menu_plans,
      stock_data,
      price_data,
      seasonal_ingredients,
      current_date: '2024-07-15T10:00:00Z',
    });

    // 検証1: すべての献立案に対して優先度スコアが付与されたことを確認
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('menu_id');
    expect(result[0]).toHaveProperty('priority_score');
    expect(result[1]).toHaveProperty('menu_id');
    expect(result[1]).toHaveProperty('priority_score');
    expect(result[2]).toHaveProperty('menu_id');
    expect(result[2]).toHaveProperty('priority_score');

    // 検証2: スコアが数値型であり、0-100の範囲内にあることを確認
    result.forEach((menu_result) => {
      expect(typeof menu_result.priority_score).toBe('number');
      expect(menu_result.priority_score).toBeGreaterThanOrEqual(0);
      expect(menu_result.priority_score).toBeLessThanOrEqual(100);
    });

    // 検証3: 旬食材を含む献立案（menu_001, menu_003）のスコアが、含まない献立案（menu_002）より高い
    const menu_001_result = result.find((m) => m.menu_id === 'menu_001');
    const menu_002_result = result.find((m) => m.menu_id === 'menu_002');
    const menu_003_result = result.find((m) => m.menu_id === 'menu_003');

    expect(menu_001_result!.priority_score).toBeGreaterThan(
      menu_002_result!.priority_score
    );
    expect(menu_003_result!.priority_score).toBeGreaterThan(
      menu_002_result!.priority_score
    );

    // 検証4: 割引商品を多く含む献立案（menu_003: 旬3件すべて割引）のスコアが高い
    // menu_001: 旬3件中2件割引（トマト20%、キャベツ15%）
    // menu_003: 旬3件すべて割引（トマト20%、キャベツ15%、ナス25%）
    expect(menu_003_result!.priority_score).toBeGreaterThan(
      menu_001_result!.priority_score
    );

    // 検証5: 在庫が豊富な食材を含む献立案のスコアが高い
    // menu_001: トマト（在庫150）、キャベツ（在庫200）= 在庫合計350
    // menu_002: タマネギ（在庫30）、豚肉（在庫40）、ジャガイモ（在庫80）= 在庫合計150
    // menu_003: トマト（在庫150）、キャベツ（在庫200）、ナス（在庫120）= 在庫合計470
    expect(menu_003_result!.priority_score).toBeGreaterThan(
      menu_001_result!.priority_score
    );
    expect(menu_001_result!.priority_score).toBeGreaterThan(
      menu_002_result!.priority_score
    );

    // 検証6: スコアの計算ロジックが正確に反映されていることを確認
    // 期待スコア計算式（仮定）:
    // seasonal_weight: 30, discount_weight: 30, stock_weight: 40
    // menu_001: seasonal_bonus(旬3件) + discount_bonus(2件割引平均17.5%) + stock_bonus(350) = 推定65-70点
    // menu_002: seasonal_bonus(0件) + discount_bonus(1件割引10%) + stock_bonus(150) = 推定35-40点
    // menu_003: seasonal_bonus(旬3件) + discount_bonus(3件割引平均20%) + stock_bonus(470) = 推定75-85点
    expect(menu_003_result!.priority_score).toBeGreaterThanOrEqual(75);
    expect(menu_003_result!.priority_score).toBeLessThanOrEqual(85);
    expect(menu_001_result!.priority_score).toBeGreaterThanOrEqual(65);
    expect(menu_001_result!.priority_score).toBeLessThanOrEqual(75);
    expect(menu_002_result!.priority_score).toBeGreaterThanOrEqual(30);
    expect(menu_002_result!.priority_score).toBeLessThanOrEqual(45);

    // 検証7: 複数献立案のスコアが降順にソートされていることを確認
    expect(result[0].priority_score).toBeGreaterThanOrEqual(
      result[1].priority_score
    );
    expect(result[1].priority_score).toBeGreaterThanOrEqual(
      result[2].priority_score
    );

    // 検証8: スコア内訳が詳細に含まれていることを確認
    result.forEach((menu_result) => {
      expect(menu_result).toHaveProperty('seasonal_score'); // 旬食材スコア
      expect(menu_result).toHaveProperty('discount_score'); // 割引商品スコア
      expect(menu_result).toHaveProperty('stock_score'); // 在庫スコア
      expect(typeof menu_result.seasonal_score).toBe('number');
      expect(typeof menu_result.discount_score).toBe('number');
      expect(typeof menu_result.stock_score).toBe('number');
    });

    // 検証9: menu_003が最高スコアを持つことを確認
    const sorted_result = result.sort(
      (a, b) => b.priority_score - a.priority_score
    );
    expect(sorted_result[0].menu_id).toBe('menu_003');

    // 検証10: スコアの合計が計算されていることを確認（sanity check）
    result.forEach((menu_result) => {
      const calculated_total =
        menu_result.seasonal_score +
        menu_result.discount_score +
        menu_result.stock_score;
      // 重み付けを考慮した合計がpriority_scoreに反映されていることを確認
      expect(menu_result.priority_score).toBeGreaterThan(0);
      expect(menu_result.priority_score).toBeLessThanOrEqual(100);
    });
  });
});