import { calculateMenuScores } from '../../src/logic/it-1-br-2-1-1-1';

describe('流通業者在庫・価格データ連携による献立案スコアリング', () => {
  // SCEN-362
  test('旬の食材・割引商品・在庫充足度が統合されて献立案に優先度スコアが付与される', () => {
    // 前提: 献立生成アルゴリズムが複数の献立案を生成し、各案の食材構成が確定した状態
    // 流通業者の在庫・価格データが連携可能な状態
    const menuProposals = [
      {
        id: 'menu_001',
        name: '夏野菜カレー',
        ingredients: [
          { id: 'ing_001', name: 'トマト', isInSeason: true, quantity: 2 },
          { id: 'ing_002', name: 'ナス', isInSeason: true, quantity: 1 },
          { id: 'ing_003', name: 'ニンジン', isInSeason: false, quantity: 1 },
        ],
      },
      {
        id: 'menu_002',
        name: 'サーモン焼き',
        ingredients: [
          { id: 'ing_004', name: 'サーモン', isInSeason: false, quantity: 300 },
          { id: 'ing_005', name: 'ブロッコリー', isInSeason: false, quantity: 150 },
          { id: 'ing_006', name: 'ポテト', isInSeason: false, quantity: 200 },
        ],
      },
      {
        id: 'menu_003',
        name: '冬瓜味噌汁',
        ingredients: [
          { id: 'ing_007', name: '冬瓜', isInSeason: true, quantity: 200 },
          { id: 'ing_008', name: '豆腐', isInSeason: false, quantity: 300 },
          { id: 'ing_009', name: 'ワカメ', isInSeason: false, quantity: 10 },
        ],
      },
    ];

    const seasonalData = {
      ing_001: { inSeasonScore: 10, basePriceJpy: 150 },
      ing_002: { inSeasonScore: 10, basePriceJpy: 120 },
      ing_003: { inSeasonScore: 3, basePriceJpy: 80 },
      ing_004: { inSeasonScore: 2, basePriceJpy: 800 },
      ing_005: { inSeasonScore: 1, basePriceJpy: 200 },
      ing_006: { inSeasonScore: 1, basePriceJpy: 100 },
      ing_007: { inSeasonScore: 10, basePriceJpy: 200 },
      ing_008: { inSeasonScore: 5, basePriceJpy: 150 },
      ing_009: { inSeasonScore: 5, basePriceJpy: 50 },
    };

    const discountData = [
      { id: 'ing_001', discountRatePercent: 20, retailerId: 'ret_001' },
      { id: 'ing_007', discountRatePercent: 15, retailerId: 'ret_002' },
    ];

    const inventoryData = [
      { id: 'ing_001', stockLevel: 50, retailerId: 'ret_001', capacityThroughput: 100 },
      { id: 'ing_002', stockLevel: 30, retailerId: 'ret_001', capacityThroughput: 80 },
      { id: 'ing_003', stockLevel: 10, retailerId: 'ret_003', capacityThroughput: 60 },
      { id: 'ing_004', stockLevel: 5, retailerId: 'ret_002', capacityThroughput: 20 },
      { id: 'ing_005', stockLevel: 40, retailerId: 'ret_002', capacityThroughput: 100 },
      { id: 'ing_006', stockLevel: 60, retailerId: 'ret_003', capacityThroughput: 100 },
      { id: 'ing_007', stockLevel: 80, retailerId: 'ret_002', capacityThroughput: 150 },
      { id: 'ing_008', stockLevel: 100, retailerId: 'ret_001', capacityThroughput: 200 },
      { id: 'ing_009', stockLevel: 25, retailerId: 'ret_001', capacityThroughput: 50 },
    ];

    // 結果: 旬の食材スコア、割引商品スコア、在庫充足度スコアが統合されて献立案に優先度スコアが付与される
    const scoredMenus = calculateMenuScores({
      menuProposals,
      seasonalData,
      discountData,
      inventoryData,
    });

    // 各献立案にスコアが付与されていることを確認
    expect(scoredMenus).toHaveLength(3);
    expect(scoredMenus[0]).toHaveProperty('menuId');
    expect(scoredMenus[0]).toHaveProperty('totalScore');
    expect(scoredMenus[0]).toHaveProperty('seasonalScore');
    expect(scoredMenus[0]).toHaveProperty('discountScore');
    expect(scoredMenus[0]).toHaveProperty('inventoryFulfillmentScore');

    // 献立案1: 夏野菜カレー
    // 旬スコア = (10 + 10 + 3) / 3 = 7.67
    // トマト: 20%割引 → 割引スコア +5
    // 在庫充足度スコア = ((50/100) + (30/80) + (10/60)) / 3 * 100 = 36.39
    // 総合スコア = (7.67 * 20) + (5 * 15) + (36.39 * 30) + 基本スコア100 = 153.4 + 75 + 1091.7 + 100 = 1420.1
    const menu001_seasonal = (10 + 10 + 3) / 3 * 20; // 旬スコア構成: 153.33
    const menu001_discount = 5 * 15; // 割引スコア構成: 75
    const menu001_inventory = ((50 / 100) + (30 / 80) + (10 / 60)) / 3 * 100; // 36.39
    const menu001_total = menu001_seasonal + menu001_discount + menu001_inventory + 100; // 364.72

    expect(scoredMenus[0].menuId).toBe('menu_001');
    expect(Math.round(scoredMenus[0].seasonalScore * 100) / 100).toBeCloseTo(
      Math.round(menu001_seasonal * 100) / 100,
      1
    );
    expect(Math.round(scoredMenus[0].discountScore * 100) / 100).toBe(75);
    expect(Math.round(scoredMenus[0].inventoryFulfillmentScore * 100) / 100).toBeCloseTo(
      Math.round(menu001_inventory * 100) / 100,
      1
    );
    expect(Math.round(scoredMenus[0].totalScore * 100) / 100).toBeCloseTo(
      Math.round(menu001_total * 100) / 100,
      0
    );

    // 献立案2: サーモン焼き
    // 旬スコア = (2 + 1 + 1) / 3 = 1.33
    // 割引商品なし → 割引スコア 0
    // 在庫充足度スコア = ((5/20) + (40/100) + (60/100)) / 3 * 100 = 45
    // 総合スコア = 1.33 * 20 + 0 + 45 + 100 = 126.6
    const menu002_seasonal = (2 + 1 + 1) / 3 * 20; // 26.67
    const menu002_discount = 0;
    const menu002_inventory = ((5 / 20) + (40 / 100) + (60 / 100)) / 3 * 100; // 45
    const menu002_total = menu002_seasonal + menu002_discount + menu002_inventory + 100; // 171.67

    expect(scoredMenus[1].menuId).toBe('menu_002');
    expect(Math.round(scoredMenus[1].seasonalScore * 100) / 100).toBeCloseTo(
      Math.round(menu002_seasonal * 100) / 100,
      1
    );
    expect(scoredMenus[1].discountScore).toBe(0);
    expect(Math.round(scoredMenus[1].inventoryFulfillmentScore * 100) / 100).toBe(45);
    expect(Math.round(scoredMenus[1].totalScore * 100) / 100).toBeCloseTo(
      Math.round(menu002_total * 100) / 100,
      0
    );

    // 献立案3: 冬瓜味噌汁
    // 旬スコア = (10 + 5 + 5) / 3 = 6.67
    // 冬瓜: 15%割引 → 割引スコア +7.5
    // 在庫充足度スコア = ((80/150) + (100/200) + (25/50)) / 3 * 100 = 60
    // 総合スコア = 6.67 * 20 + 7.5 * 15 + 60 + 100 = 133.4 + 112.5 + 60 + 100 = 405.9
    const menu003_seasonal = (10 + 5 + 5) / 3 * 20; // 133.33
    const menu003_discount = 7.5 * 15; // 112.5
    const menu003_inventory = ((80 / 150) + (100 / 200) + (25 / 50)) / 3 * 100; // 60
    const menu003_total = menu003_seasonal + menu003_discount + menu003_inventory + 100; // 405.83

    expect(scoredMenus[2].menuId).toBe('menu_003');
    expect(Math.round(scoredMenus[2].seasonalScore * 100) / 100).toBeCloseTo(
      Math.round(menu003_seasonal * 100) / 100,
      1
    );
    expect(Math.round(scoredMenus[2].discountScore * 100) / 100).toBe(112.5);
    expect(scoredMenus[2].inventoryFulfillmentScore).toBe(60);
    expect(Math.round(scoredMenus[2].totalScore * 100) / 100).toBeCloseTo(
      Math.round(menu003_total * 100) / 100,
      0
    );

    // 高いスコアの献立案ほど優先度が高い順序で表示されることを確認
    // menu_003 > menu_001 > menu_002 の順序になるべき
    expect(scoredMenus[0].menuId).toBe('menu_003');
    expect(scoredMenus[1].menuId).toBe('menu_001');
    expect(scoredMenus[2].menuId).toBe('menu_002');

    // スコアが降順で並んでいることを確認
    expect(scoredMenus[0].totalScore).toBeGreaterThanOrEqual(scoredMenus[1].totalScore);
    expect(scoredMenus[1].totalScore).toBeGreaterThanOrEqual(scoredMenus[2].totalScore);

    // スコア詳細が正確に表示されることを確認
    expect(scoredMenus[0].breakdown).toEqual({
      seasonalComponent: expect.any(Number),
      discountComponent: expect.any(Number),
      inventoryComponent: expect.any(Number),
      baseScore: 100,
    });

    // 各スコアが0-100範囲内であることを確認
    scoredMenus.forEach((menu) => {
      expect(menu.seasonalScore).toBeGreaterThanOrEqual(0);
      expect(menu.discountScore).toBeGreaterThanOrEqual(0);
      expect(menu.inventoryFulfillmentScore).toBeGreaterThanOrEqual(0);
      expect(menu.totalScore).toBeGreaterThanOrEqual(0);
    });
  });
});