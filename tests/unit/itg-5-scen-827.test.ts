import { calculateDiscountedMenuItemPrice } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム季節ルール実装機能 - 極端な高割引の数値精度検証', () => {
  // SCEN-827
  test('割引率99.99%の極端な高割引条件下で数値計算を正確に処理する', () => {
    // ========== Precondition ==========
    // テスト環境でアルゴリズム改善・検証ダッシュボードシステムが起動
    // 献立生成アルゴリズムの季節ルール実装機能にアクセス可能な状態
    // テスト対象の献立アイテムに割引率99.99%を設定
    const basePrice = 1000; // 基本価格: 1,000円
    const discountRatePercent = 99.99; // 割引率: 99.99%

    // ========== Action ==========
    // 割引後の価格計算処理を実行
    const result = calculateDiscountedMenuItemPrice({
      basePrice,
      discountRatePercent,
    });

    // ========== Assertion: (1) 割引後の価格が正の有限値として正しく計算される ==========
    // 期待値: basePrice × (1 - discountRatePercent/100) = 1000 × (1 - 0.9999) = 1000 × 0.0001 = 0.1
    const expectedDiscountedPrice = 0.1;
    expect(result.discountedPrice).toBe(expectedDiscountedPrice);

    // ========== Assertion: (2) 割引後価格が正の有限値 ==========
    expect(isFinite(result.discountedPrice)).toBe(true);
    expect(result.discountedPrice > 0).toBe(true);

    // ========== Assertion: (3) 浮動小数点数の丸め誤差が許容範囲内に収まる ==========
    // 許容誤差: ±0.001 (0.1円以下)
    const tolerance = 0.001;
    expect(Math.abs(result.discountedPrice - expectedDiscountedPrice)).toBeLessThanOrEqual(tolerance);

    // ========== Assertion: (4) 負の価格が発生していない ==========
    expect(result.discountedPrice >= 0).toBe(true);

    // ========== Assertion: (5) NaN が発生していない ==========
    expect(Number.isNaN(result.discountedPrice)).toBe(false);

    // ========== Assertion: (6) 無限大が発生していない ==========
    expect(Number.isFinite(result.discountedPrice)).toBe(true);

    // ========== Assertion: (7) 割引率99.99%が適切に反映されているか確認 ==========
    const discountAmount = result.discountAmount;
    const expectedDiscountAmount = basePrice - expectedDiscountedPrice;
    expect(Math.abs(discountAmount - expectedDiscountAmount)).toBeLessThanOrEqual(tolerance);

    // ========== Assertion: (8) 割引率の表現が正しく記録されている ==========
    expect(result.discountRatePercent).toBe(discountRatePercent);

    // ========== Assertion: (9) システムがエラーをスローせず安定した状態を保つ ==========
    // 戻り値に error フィールドが存在しないか、null/undefined であることを確認
    expect(result.error).toBeUndefined();

    // ========== Assertion: (10) ログやアラートに異常が記録されていない ==========
    // 異常フラグが立っていないことを確認
    expect(result.hasAnomalyFlag).toBe(false);

    // ========== Assertion: (11) 計算過程の中間値も妥当であることを確認 ==========
    // 割引係数（1 - discountRatePercent/100）= 0.0001 が正しく計算されている
    const expectedDiscountCoefficient = 1 - discountRatePercent / 100;
    expect(Math.abs(result.discountCoefficient - expectedDiscountCoefficient)).toBeLessThanOrEqual(tolerance);

    // ========== Assertion: (12) 複数回の計算結果が一貫していることを確認（浮動小数点数の再現性） ==========
    const result2 = calculateDiscountedMenuItemPrice({
      basePrice,
      discountRatePercent,
    });
    expect(result2.discountedPrice).toBe(result.discountedPrice);
  });
});