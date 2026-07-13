import { calculatePriorityScore } from '../../src/logic/it-1-br-6-2-1-1';

describe('旬食材・割引商品優先度スコア計算機能', () => {
  // SCEN-486: [normal] 旬食材・割引商品優先度スコア計算 - 季節パターン・割引率閾値・販売期間ルールに基づいて優先度スコアが正常に計算される
  test('複数食材の優先度スコアが季節パターン・割引率・販売期間ルールに基づいて正確に計算される', () => {
    // ===== テストデータ準備 =====
    const current_date = new Date('2024-06-15T12:00:00Z'); // 6月中旬（夏季）
    const seasonal_threshold = 50; // 旬食材判定の基準スコア
    const discount_threshold = 20; // 割引率ボーナス加算の閾値（20%以上で+10点）
    const bonus_score = 10; // 割引率閾値超過時のボーナススコア

    // 複数食材データ準備
    const ingredients = [
      {
        ingredient_id: 'ing_001',
        name: 'トマト',
        seasonal_pattern: 'summer', // 夏が旬
        current_season: 'summer',
        discount_rate: 25, // 25%割引（閾値超過）
        sale_start_date: '2024-06-01',
        sale_end_date: '2024-06-30',
        is_in_season: true,
      },
      {
        ingredient_id: 'ing_002',
        name: 'キャベツ',
        seasonal_pattern: 'spring', // 春が旬
        current_season: 'summer',
        discount_rate: 15, // 15%割引（閾値以下）
        sale_start_date: '2024-06-10',
        sale_end_date: '2024-06-20',
        is_in_season: false,
      },
      {
        ingredient_id: 'ing_003',
        name: 'スイカ',
        seasonal_pattern: 'summer', // 夏が旬
        current_season: 'summer',
        discount_rate: 30, // 30%割引（閾値超過）
        sale_start_date: '2024-06-15',
        sale_end_date: '2024-08-31',
        is_in_season: true,
      },
      {
        ingredient_id: 'ing_004',
        name: 'ダイコン',
        seasonal_pattern: 'winter', // 冬が旬
        current_season: 'summer',
        discount_rate: 0, // 割引なし
        sale_start_date: '2024-06-01',
        sale_end_date: '2024-06-30',
        is_in_season: false,
      },
      {
        ingredient_id: 'ing_005',
        name: 'ナス',
        seasonal_pattern: 'summer', // 夏が旬
        current_season: 'summer',
        discount_rate: 22, // 22%割引（閾値超過）
        sale_start_date: '2024-06-14', // 販売期間外直前
        sale_end_date: '2024-06-14',
        is_in_season: true,
      },
    ];

    // ===== スコア計算ルール（structured.formula に基づく） =====
    // BASE_SCORE = 40
    // seasonal_bonus = 30 （旬食材なら +30、非旬なら +0）
    // discount_bonus = discount_rate ≥ 20 ? 10 : 0
    // sale_period_bonus = 販売期間内なら +15、外なら +0
    // TOTAL_SCORE = BASE_SCORE + seasonal_bonus + discount_bonus + sale_period_bonus
    //
    // 期待スコア計算：
    // トマト(ing_001):  40 + 30(旬) + 10(割引≥20%) + 15(販売期間内) = 95
    // キャベツ(ing_002): 40 + 0(非旬) + 0(割引<20%) + 15(販売期間内) = 55
    // スイカ(ing_003):  40 + 30(旬) + 10(割引≥20%) + 15(販売期間内) = 95
    // ダイコン(ing_004): 40 + 0(非旬) + 0(割引=0%) + 15(販売期間内) = 55
    // ナス(ing_005):   40 + 30(旬) + 10(割引≥20%) + 0(販売期間外) = 80

    // ===== 関数実行 =====
    const results = ingredients.map((ing) =>
      calculatePriorityScore({
        ingredient_id: ing.ingredient_id,
        current_date: current_date,
        seasonal_pattern: ing.seasonal_pattern,
        current_season: ing.current_season,
        discount_rate: ing.discount_rate,
        discount_threshold: discount_threshold,
        sale_start_date: ing.sale_start_date,
        sale_end_date: ing.sale_end_date,
        bonus_score: bonus_score,
      })
    );

    // ===== アサーション：複合条件を満たす食材が最高スコアを取得 =====
    const tomatoResult = results[0]; // トマト：旬×高割引×販売期間内
    const cabbageResult = results[1]; // キャベツ：非旬×低割引×販売期間内
    const watermelonResult = results[2]; // スイカ：旬×高割引×販売期間内
    const radishResult = results[3]; // ダイコン：非旬×割引なし×販売期間内
    const eggplantResult = results[4]; // ナス：旬×高割引×販売期間外

    // 旬×高割引×販売期間内の食材が最高スコア（95点）
    expect(tomatoResult.priority_score).toBe(95);
    expect(watermelonResult.priority_score).toBe(95);

    // 旬×高割引×販売期間外の食材（80点）
    expect(eggplantResult.priority_score).toBe(80);

    // 非旬×低割引×販売期間内の食材（55点）
    expect(cabbageResult.priority_score).toBe(55);
    expect(radishResult.priority_score).toBe(55);

    // ===== アサーション：スコアランキング検証 =====
    const sorted_results = [...results].sort(
      (a, b) => b.priority_score - a.priority_score
    );
    expect(sorted_results[0].priority_score).toBe(95); // トマト or スイカ
    expect(sorted_results[1].priority_score).toBe(95); // トマト or スイカ
    expect(sorted_results[2].priority_score).toBe(80); // ナス
    expect(sorted_results[3].priority_score).toBe(55); // キャベツ or ダイコン
    expect(sorted_results[4].priority_score).toBe(55); // キャベツ or ダイコン

    // ===== アサーション：旬食材スコアが非旬食材より高い =====
    // トマト（旬、95点）vs キャベツ（非旬、55点）
    expect(tomatoResult.priority_score).toBeGreaterThan(cabbageResult.priority_score);
    // スイカ（旬、95点）vs ダイコン（非旬、55点）
    expect(watermelonResult.priority_score).toBeGreaterThan(radishResult.priority_score);

    // ===== アサーション：割引率が高い食材が優先度向上を確認 =====
    // 25%割引のトマト（95点）vs 15%割引のキャベツ（55点）
    expect(tomatoResult.priority_score).toBeGreaterThan(cabbageResult.priority_score);
    // 30%割引のスイカ（95点）vs 0%割引のダイコン（55点）
    expect(watermelonResult.priority_score).toBeGreaterThan(radishResult.priority_score);

    // ===== アサーション：販売期間内外の影響を確認 =====
    // ナス（旬×割引≥20%だが販売期間外、80点）vs トマト（旬×割引≥20%×販売期間内、95点）
    expect(tomatoResult.priority_score).toBeGreaterThan(eggplantResult.priority_score);
    expect(tomatoResult.priority_score - eggplantResult.priority_score).toBe(15); // 販売期間ボーナスが15点

    // ===== アサーション：割引率閾値を超える食材へのボーナス加算確認 =====
    // トマト（割引率25% ≥ 20%閾値）：+10ボーナス加算
    expect(tomatoResult.has_discount_bonus).toBe(true);
    expect(tomatoResult.bonus_applied).toBe(bonus_score);

    // キャベツ（割引率15% < 20%閾値）：ボーナスなし
    expect(cabbageResult.has_discount_bonus).toBe(false);
    expect(cabbageResult.bonus_applied).toBe(0);

    // スイカ（割引率30% ≥ 20%閾値）：+10ボーナス加算
    expect(watermelonResult.has_discount_bonus).toBe(true);
    expect(watermelonResult.bonus_applied).toBe(bonus_score);

    // ===== アサーション：割引率0%のエッジケース処理 =====
    // ダイコン（割引率0%、非旬、販売期間内）：40 + 0 + 0 + 15 = 55
    expect(radishResult.priority_score).toBe(55);
    expect(radishResult.has_discount_bonus).toBe(false);

    // ===== アサーション：販売期間終了直前のエッジケース処理 =====
    // ナス（販売期間終了日が当日 2024-06-14、評価日 2024-06-15）：販売期間外と判定
    expect(eggplantResult.is_within_sale_period).toBe(false);
    expect(eggplantResult.priority_score).toBe(80);

    // ===== アサーション：各結果オブジェクトの必須フィールド存在確認 =====
    results.forEach((result) => {
      expect(result).toHaveProperty('ingredient_id');
      expect(result).toHaveProperty('priority_score');
      expect(result).toHaveProperty('seasonal_component');
      expect(result).toHaveProperty('discount_component');
      expect(result).toHaveProperty('sale_period_component');
      expect(result).toHaveProperty('base_score');
      expect(result).toHaveProperty('has_discount_bonus');
      expect(result).toHaveProperty('bonus_applied');
      expect(result).toHaveProperty('is_within_sale_period');
    });

    // ===== アサーション：スコア値の型と範囲検証 =====
    results.forEach((result) => {
      expect(typeof result.priority_score).toBe('number');
      expect(result.priority_score).toBeGreaterThanOrEqual(0);
      expect(result.priority_score).toBeLessThanOrEqual(100); // スコア最大値
      expect(Number.isInteger(result.priority_score)).toBe(true);
    });

    // ===== アサーション：コンポーネントスコアの検証 =====
    // トマト：seasonal_component=30, discount_component=10, sale_period_component=15
    expect(tomatoResult.seasonal_component).toBe(30);
    expect(tomatoResult.discount_component).toBe(10);
    expect(tomatoResult.sale_period_component).toBe(15);
    expect(tomatoResult.base_score).toBe(40);

    // ダイコン（非旬）：seasonal_component=0, discount_component=0, sale_period_component=15
    expect(radishResult.seasonal_component).toBe(0);
    expect(radishResult.discount_component).toBe(0);
    expect(radishResult.sale_period_component).toBe(15);

    // ナス（販売期間外）：seasonal_component=30, discount_component=10, sale_period_component=0
    expect(eggplantResult.seasonal_component).toBe(30);
    expect(eggplantResult.discount_component).toBe(10);
    expect(eggplantResult.sale_period_component).toBe(0);

    // ===== アサーション：複合スコア計算の数式検証 =====
    // total_score = base_score + seasonal_component + discount_component + sale_period_component
    results.forEach((result) => {
      const calculated_total =
        result.base_score +
        result.seasonal_component +
        result.discount_component +
        result.sale_period_component;
      expect(result.priority_score).toBe(calculated_total);
    });
  });
});