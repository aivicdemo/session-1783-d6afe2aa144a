import { calculatePriorityScoringFromThreeAxes } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-709
  test('3軸スコア（ビジネス価値・技術難度・ユーザーインパクト）から総合優先度スコアが正確に算出される', () => {
    // テストパターン1: 最大値ケース（すべて100）
    const result_max = calculatePriorityScoringFromThreeAxes({
      businessValue: 100,
      technicalDifficulty: 100,
      userImpact: 100,
    });
    expect(result_max).toBe(100);
    expect(result_max).toBeGreaterThanOrEqual(0);
    expect(result_max).toBeLessThanOrEqual(100);

    // テストパターン2: 最小値ケース（すべて0）
    const result_min = calculatePriorityScoringFromThreeAxes({
      businessValue: 0,
      technicalDifficulty: 0,
      userImpact: 0,
    });
    expect(result_min).toBe(0);
    expect(result_min).toBeGreaterThanOrEqual(0);
    expect(result_min).toBeLessThanOrEqual(100);

    // テストパターン3: 均等配分（各軸50）
    // 計算式: (50 * 0.4 + (100 - 50) * 0.3 + 50 * 0.3) = 20 + 15 + 15 = 50
    const result_equal = calculatePriorityScoringFromThreeAxes({
      businessValue: 50,
      technicalDifficulty: 50,
      userImpact: 50,
    });
    expect(result_equal).toBe(50);

    // テストパターン4: ビジネス価値重視（ビジネス価値80、技術難度20、ユーザーインパクト30）
    // 計算式: (80 * 0.4 + (100 - 20) * 0.3 + 30 * 0.3) = 32 + 24 + 9 = 65
    const result_business_priority = calculatePriorityScoringFromThreeAxes({
      businessValue: 80,
      technicalDifficulty: 20,
      userImpact: 30,
    });
    expect(result_business_priority).toBe(65);

    // テストパターン5: 技術難度が高い場合（ビジネス価値90、技術難度80、ユーザーインパクト70）
    // 計算式: (90 * 0.4 + (100 - 80) * 0.3 + 70 * 0.3) = 36 + 6 + 21 = 63
    const result_high_difficulty = calculatePriorityScoringFromThreeAxes({
      businessValue: 90,
      technicalDifficulty: 80,
      userImpact: 70,
    });
    expect(result_high_difficulty).toBe(63);

    // テストパターン6: ユーザーインパクト重視（ビジネス価値40、技術難度30、ユーザーインパクト95）
    // 計算式: (40 * 0.4 + (100 - 30) * 0.3 + 95 * 0.3) = 16 + 21 + 28.5 = 65.5 → 66（四捨五入）
    const result_user_impact_priority = calculatePriorityScoringFromThreeAxes({
      businessValue: 40,
      technicalDifficulty: 30,
      userImpact: 95,
    });
    expect(result_user_impact_priority).toBe(66);

    // テストパターン7: 小数点を含む入力値（ビジネス価値75.5、技術難度45.3、ユーザーインパクト62.8）
    // 計算式: (75.5 * 0.4 + (100 - 45.3) * 0.3 + 62.8 * 0.3) = 30.2 + 16.41 + 18.84 = 65.45 → 65（四捨五入）
    const result_decimal = calculatePriorityScoringFromThreeAxes({
      businessValue: 75.5,
      technicalDifficulty: 45.3,
      userImpact: 62.8,
    });
    expect(result_decimal).toBe(65);

    // テストパターン8: 境界値（ビジネス価値100、技術難度0、ユーザーインパクト0）
    // 計算式: (100 * 0.4 + (100 - 0) * 0.3 + 0 * 0.3) = 40 + 30 + 0 = 70
    const result_boundary_max_business = calculatePriorityScoringFromThreeAxes({
      businessValue: 100,
      technicalDifficulty: 0,
      userImpact: 0,
    });
    expect(result_boundary_max_business).toBe(70);

    // テストパターン9: 境界値（ビジネス価値0、技術難度100、ユーザーインパクト100）
    // 計算式: (0 * 0.4 + (100 - 100) * 0.3 + 100 * 0.3) = 0 + 0 + 30 = 30
    const result_boundary_low_business = calculatePriorityScoringFromThreeAxes({
      businessValue: 0,
      technicalDifficulty: 100,
      userImpact: 100,
    });
    expect(result_boundary_low_business).toBe(30);

    // テストパターン10: 全スコアが有効範囲内であることを確認
    const all_results = [
      result_max,
      result_min,
      result_equal,
      result_business_priority,
      result_high_difficulty,
      result_user_impact_priority,
      result_decimal,
      result_boundary_max_business,
      result_boundary_low_business,
    ];
    all_results.forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(score)).toBe(true);
    });
  });
});