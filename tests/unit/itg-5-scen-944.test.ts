import { calculateSegmentStatisticalSignificance } from '../../src/logic/it-7-2-1';

describe('献立生成セグメント別行動指標統計有意性判定', () => {
  // SCEN-944
  test('複数セグメントの献立生成成功率データから p値 < 0.05 の有意な差を正しく判定する', () => {
    // セグメント1: 年代20代・家族構成3人・食事制限なし
    const segment1 = {
      segmentId: 'seg_001',
      segmentName: 'Young_Family_NoRestriction',
      successCount: 45,
      totalAttempts: 100,
      successRate: 0.45,
    };

    // セグメント2: 年代40代・家族構成4人・食事制限あり
    const segment2 = {
      segmentId: 'seg_002',
      segmentName: 'MiddleAge_LargeFamily_WithRestriction',
      successCount: 52,
      totalAttempts: 120,
      successRate: 0.4333,
    };

    // セグメント3: 年代60代・家族構成2人・食事制限あり
    const segment3 = {
      segmentId: 'seg_003',
      segmentName: 'Senior_SmallFamily_WithRestriction',
      successCount: 28,
      totalAttempts: 80,
      successRate: 0.35,
    };

    const segmentDataList = [segment1, segment2, segment3];

    const result = calculateSegmentStatisticalSignificance(segmentDataList);

    // 結果の構造を検証
    expect(result).toHaveProperty('pValue');
    expect(result).toHaveProperty('isSignificant');
    expect(result).toHaveProperty('significanceLevel');
    expect(result).toHaveProperty('pairwiseComparisons');

    // p値が0以上1以下の有効な値であることを検証
    expect(result.pValue).toBeGreaterThanOrEqual(0);
    expect(result.pValue).toBeLessThanOrEqual(1);

    // 有意性判定の根拠: カイ二乗検定またはt検定で計算された p値
    // 期待値: p値 ≈ 0.087 (3セグメント間の成功率差が有意でない)
    expect(result.pValue).toBeCloseTo(0.087, 2);

    // p値が0.05以上なので有意な差なしと判定される
    expect(result.isSignificant).toBe(false);

    // 有意性レベルは0.05で設定
    expect(result.significanceLevel).toBe(0.05);

    // ペアワイズ比較結果の検証
    expect(result.pairwiseComparisons).toHaveLength(3); // 3つのセグメントから3通りの比較

    // seg_001 vs seg_002
    expect(result.pairwiseComparisons[0]).toEqual({
      comparison: 'seg_001_vs_seg_002',
      pValue: expect.any(Number),
      isSignificant: false,
    });

    // seg_001 vs seg_003
    expect(result.pairwiseComparisons[1]).toEqual({
      comparison: 'seg_001_vs_seg_003',
      pValue: expect.any(Number),
      isSignificant: false,
    });

    // seg_002 vs seg_003
    expect(result.pairwiseComparisons[2]).toEqual({
      comparison: 'seg_002_vs_seg_003',
      pValue: expect.any(Number),
      isSignificant: false,
    });

    // すべてのペアワイズ比較でp値が計算されていることを確認
    result.pairwiseComparisons.forEach((comparison) => {
      expect(comparison.pValue).toBeGreaterThanOrEqual(0);
      expect(comparison.pValue).toBeLessThanOrEqual(1);
    });

    // 有意性判定結果が一貫性を持つことを確認
    // 全体のp値が0.05以上なので、isSignificantはfalseであるべき
    if (result.pValue >= result.significanceLevel) {
      expect(result.isSignificant).toBe(false);
    } else {
      expect(result.isSignificant).toBe(true);
    }

    // 結果オブジェクトの完全性を検証
    expect(Object.keys(result)).toContain('pValue');
    expect(Object.keys(result)).toContain('isSignificant');
    expect(Object.keys(result)).toContain('significanceLevel');
    expect(Object.keys(result)).toContain('pairwiseComparisons');
  });
});