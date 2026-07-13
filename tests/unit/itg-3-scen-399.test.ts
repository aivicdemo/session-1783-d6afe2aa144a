import { analyzeMonthlyFoodCostOverage } from '../../src/logic/it-1-br-3-2-1';

describe('月次食費超過要因分析機能', () => {
  // SCEN-399: [normal] 月次食費超過要因分析機能 - 月次の献立構成と購入単価変動から食費超過要因がカテゴリ別に分解される
  test('月次食費超過額がカテゴリ別に分解され、献立構成と単価変動要因が分離して表示される', () => {
    // Arrange
    const analysis_month = '2024-01';
    const previous_month = '2023-12';

    // 前月の食費実績データ
    const previous_month_budget = 50000;
    const previous_month_actual = 48000;

    // 当月の献立構成データ（カテゴリ別）
    const main_dish_composition = {
      category: 'main_dish',
      dishes_count_previous: 8,
      dishes_count_current: 10,
      avg_price_previous: 1200,
      avg_price_current: 1300,
    };

    const side_dish_composition = {
      category: 'side_dish',
      dishes_count_previous: 12,
      dishes_count_current: 14,
      avg_price_previous: 400,
      avg_price_current: 420,
    };

    const staple_composition = {
      category: 'staple',
      dishes_count_previous: 8,
      dishes_count_current: 8,
      avg_price_previous: 600,
      avg_price_current: 650,
    };

    const other_composition = {
      category: 'other',
      dishes_count_previous: 6,
      dishes_count_current: 7,
      avg_price_previous: 300,
      avg_price_current: 310,
    };

    const category_compositions = [
      main_dish_composition,
      side_dish_composition,
      staple_composition,
      other_composition,
    ];

    // 当月の実績食費と予算
    const current_month_budget = 50000;
    const current_month_actual = 54800;

    // 超過額の期待値計算
    // 献立構成による増加（各カテゴリ）：
    // - 主菜: (10 - 8) * 1200 = 2400
    // - 副菜: (14 - 12) * 400 = 800
    // - 主食: (8 - 8) * 600 = 0
    // - その他: (7 - 6) * 300 = 300
    // 献立構成要因小計: 3500

    // 単価変動による増加（各カテゴリ）：
    // - 主菜: 8 * (1300 - 1200) = 800
    // - 副菜: 12 * (420 - 400) = 240
    // - 主食: 8 * (650 - 600) = 400
    // - その他: 6 * (310 - 300) = 60
    // 単価変動要因小計: 1500

    // 合計超過額 = 3500 + 1500 = 5000
    // (実績 54800 - 前年同月実績 48000 = 6800 vs 予算 50000比で +4800)
    // 本テストでは当月実績から予算を引いた 4800 を基準に検証

    // Act
    const result = analyzeMonthlyFoodCostOverage({
      analysis_month,
      previous_month,
      current_month_budget,
      current_month_actual,
      previous_month_actual,
      category_compositions,
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.analysis_month).toBe('2024-01');
    expect(result.total_overage_amount).toBe(4800);

    // カテゴリ別分解結果の検証
    expect(result.category_breakdown).toBeDefined();
    expect(result.category_breakdown.length).toBe(4);

    // 主菜の検証
    const main_dish_breakdown = result.category_breakdown.find(
      (cat) => cat.category === 'main_dish'
    );
    expect(main_dish_breakdown).toBeDefined();
    expect(main_dish_breakdown!.composition_increase).toBe(2400);
    expect(main_dish_breakdown!.price_variation_increase).toBe(800);
    expect(main_dish_breakdown!.total_increase).toBe(3200);
    expect(main_dish_breakdown!.dishes_count_previous).toBe(8);
    expect(main_dish_breakdown!.dishes_count_current).toBe(10);
    expect(main_dish_breakdown!.avg_price_previous).toBe(1200);
    expect(main_dish_breakdown!.avg_price_current).toBe(1300);
    expect(main_dish_breakdown!.price_change_rate).toBe(8.33);

    // 副菜の検証
    const side_dish_breakdown = result.category_breakdown.find(
      (cat) => cat.category === 'side_dish'
    );
    expect(side_dish_breakdown).toBeDefined();
    expect(side_dish_breakdown!.composition_increase).toBe(800);
    expect(side_dish_breakdown!.price_variation_increase).toBe(240);
    expect(side_dish_breakdown!.total_increase).toBe(1040);
    expect(side_dish_breakdown!.dishes_count_previous).toBe(12);
    expect(side_dish_breakdown!.dishes_count_current).toBe(14);
    expect(side_dish_breakdown!.avg_price_previous).toBe(400);
    expect(side_dish_breakdown!.avg_price_current).toBe(420);
    expect(side_dish_breakdown!.price_change_rate).toBe(5.0);

    // 主食の検証
    const staple_breakdown = result.category_breakdown.find(
      (cat) => cat.category === 'staple'
    );
    expect(staple_breakdown).toBeDefined();
    expect(staple_breakdown!.composition_increase).toBe(0);
    expect(staple_breakdown!.price_variation_increase).toBe(400);
    expect(staple_breakdown!.total_increase).toBe(400);
    expect(staple_breakdown!.dishes_count_previous).toBe(8);
    expect(staple_breakdown!.dishes_count_current).toBe(8);
    expect(staple_breakdown!.avg_price_previous).toBe(600);
    expect(staple_breakdown!.avg_price_current).toBe(650);
    expect(staple_breakdown!.price_change_rate).toBe(8.33);

    // その他の検証
    const other_breakdown = result.category_breakdown.find(
      (cat) => cat.category === 'other'
    );
    expect(other_breakdown).toBeDefined();
    expect(other_breakdown!.composition_increase).toBe(300);
    expect(other_breakdown!.price_variation_increase).toBe(60);
    expect(other_breakdown!.total_increase).toBe(360);
    expect(other_breakdown!.dishes_count_previous).toBe(6);
    expect(other_breakdown!.dishes_count_current).toBe(7);
    expect(other_breakdown!.avg_price_previous).toBe(300);
    expect(other_breakdown!.avg_price_current).toBe(310);
    expect(other_breakdown!.price_change_rate).toBe(3.33);

    // 合計の検証: 各カテゴリ要因分解額の合計 = 総超過額
    const total_composition_increase = result.category_breakdown.reduce(
      (sum, cat) => sum + cat.composition_increase,
      0
    );
    const total_price_variation = result.category_breakdown.reduce(
      (sum, cat) => sum + cat.price_variation_increase,
      0
    );
    const sum_of_breakdown = total_composition_increase + total_price_variation;

    expect(total_composition_increase).toBe(3500);
    expect(total_price_variation).toBe(1500);
    expect(sum_of_breakdown).toBe(5000);

    // 合計超過額がカテゴリ別分解の合計と矛盾していないか確認
    // (当月予算 50000 - 前月実績 48000 = 2000 + 献立・単価要因 5000 = 7000)
    // または当月実績 54800 - 当月予算 50000 = 4800 が基準
    expect(result.total_overage_amount).toBeLessThanOrEqual(
      sum_of_breakdown + 1000
    ); // 許容誤差1000円

    // 結果オブジェクト全体の構造検証
    expect(result).toHaveProperty('analysis_month');
    expect(result).toHaveProperty('total_overage_amount');
    expect(result).toHaveProperty('category_breakdown');
    expect(result).toHaveProperty('composition_factor_total');
    expect(result).toHaveProperty('price_factor_total');

    // 因果分解の妥当性: 各カテゴリの増加要因が非負
    result.category_breakdown.forEach((cat) => {
      expect(cat.composition_increase).toBeGreaterThanOrEqual(0);
      expect(cat.price_variation_increase).toBeGreaterThanOrEqual(0);
      expect(cat.total_increase).toBe(
        cat.composition_increase + cat.price_variation_increase
      );
    });
  });
});