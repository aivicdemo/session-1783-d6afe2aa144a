import { calculatePriorityScore } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-711: [normal] 優先度スコアリング機能 - スコアリング基準の加重値が正しく適用されて総合スコアが計算される
  test('should calculate composite priority score correctly with weighted criteria', () => {
    // パターン 1: 性能改善度 40%, 実装難易度 30%, ユーザー影響度 30%
    // 各基準スコア: 性能改善度 80 点, 実装難易度 60 点, ユーザー影響度 75 点
    // 期待値: 80 × 0.4 + 60 × 0.3 + 75 × 0.3 = 32 + 18 + 22.5 = 72.5
    const result_pattern_1 = calculatePriorityScore({
      performance_improvement_score: 80,
      implementation_difficulty_score: 60,
      user_impact_score: 75,
      performance_improvement_weight: 0.4,
      implementation_difficulty_weight: 0.3,
      user_impact_weight: 0.3,
    });

    expect(result_pattern_1).toBe(72.5);

    // パターン 2: 性能改善度 50%, 実装難易度 25%, ユーザー影響度 25%
    // 各基準スコア: 性能改善度 90 点, 実装難易度 70 点, ユーザー影響度 85 点
    // 期待値: 90 × 0.5 + 70 × 0.25 + 85 × 0.25 = 45 + 17.5 + 21.25 = 83.75
    const result_pattern_2 = calculatePriorityScore({
      performance_improvement_score: 90,
      implementation_difficulty_score: 70,
      user_impact_score: 85,
      performance_improvement_weight: 0.5,
      implementation_difficulty_weight: 0.25,
      user_impact_weight: 0.25,
    });

    expect(result_pattern_2).toBe(83.75);

    // パターン 3: 性能改善度 60%, 実装難易度 20%, ユーザー影響度 20%
    // 各基準スコア: 性能改善度 100 点, 実装難易度 50 点, ユーザー影響度 60 点
    // 期待値: 100 × 0.6 + 50 × 0.2 + 60 × 0.2 = 60 + 10 + 12 = 82
    const result_pattern_3 = calculatePriorityScore({
      performance_improvement_score: 100,
      implementation_difficulty_score: 50,
      user_impact_score: 60,
      performance_improvement_weight: 0.6,
      implementation_difficulty_weight: 0.2,
      user_impact_weight: 0.2,
    });

    expect(result_pattern_3).toBe(82);

    // パターン 4: 全基準を均等配分 (各 33.33%)
    // 各基準スコア: 性能改善度 70 点, 実装難易度 80 点, ユーザー影響度 90 点
    // 期待値: 70 × 0.3333 + 80 × 0.3333 + 90 × 0.3333 ≈ 23.331 + 26.664 + 29.997 ≈ 79.992 → 80 (四捨五入)
    const result_pattern_4 = calculatePriorityScore({
      performance_improvement_score: 70,
      implementation_difficulty_score: 80,
      user_impact_score: 90,
      performance_improvement_weight: 0.3333,
      implementation_difficulty_weight: 0.3333,
      user_impact_weight: 0.3334,
    });

    expect(result_pattern_4).toBeCloseTo(80, 1);

    // パターン 5: ユーザー影響度に高い重みを設定
    // 性能改善度 20%, 実装難易度 30%, ユーザー影響度 50%
    // 各基準スコア: 性能改善度 55 点, 実装難易度 65 点, ユーザー影響度 95 点
    // 期待値: 55 × 0.2 + 65 × 0.3 + 95 × 0.5 = 11 + 19.5 + 47.5 = 78
    const result_pattern_5 = calculatePriorityScore({
      performance_improvement_score: 55,
      implementation_difficulty_score: 65,
      user_impact_score: 95,
      performance_improvement_weight: 0.2,
      implementation_difficulty_weight: 0.3,
      user_impact_weight: 0.5,
    });

    expect(result_pattern_5).toBe(78);

    // パターン 6: 境界値 - すべてのスコアが最小値 (0点)
    // 期待値: 0 × 0.4 + 0 × 0.3 + 0 × 0.3 = 0
    const result_pattern_6 = calculatePriorityScore({
      performance_improvement_score: 0,
      implementation_difficulty_score: 0,
      user_impact_score: 0,
      performance_improvement_weight: 0.4,
      implementation_difficulty_weight: 0.3,
      user_impact_weight: 0.3,
    });

    expect(result_pattern_6).toBe(0);

    // パターン 7: 境界値 - すべてのスコアが最大値 (100点)
    // 性能改善度 25%, 実装難易度 25%, ユーザー影響度 50%
    // 期待値: 100 × 0.25 + 100 × 0.25 + 100 × 0.5 = 25 + 25 + 50 = 100
    const result_pattern_7 = calculatePriorityScore({
      performance_improvement_score: 100,
      implementation_difficulty_score: 100,
      user_impact_score: 100,
      performance_improvement_weight: 0.25,
      implementation_difficulty_weight: 0.25,
      user_impact_weight: 0.5,
    });

    expect(result_pattern_7).toBe(100);

    // エラーテスト: 加重値の合計が 1.0 でない場合 (不正な設定)
    expect(() =>
      calculatePriorityScore({
        performance_improvement_score: 80,
        implementation_difficulty_score: 60,
        user_impact_score: 75,
        performance_improvement_weight: 0.3,
        implementation_difficulty_weight: 0.3,
        user_impact_weight: 0.3, // 合計: 0.9 (100% にならない)
      })
    ).toThrow(/加重値/);

    // エラーテスト: スコアが負の値
    expect(() =>
      calculatePriorityScore({
        performance_improvement_score: -10,
        implementation_difficulty_score: 60,
        user_impact_score: 75,
        performance_improvement_weight: 0.4,
        implementation_difficulty_weight: 0.3,
        user_impact_weight: 0.3,
      })
    ).toThrow(/スコア/);

    // エラーテスト: スコアが 100 を超える値
    expect(() =>
      calculatePriorityScore({
        performance_improvement_score: 150,
        implementation_difficulty_score: 60,
        user_impact_score: 75,
        performance_improvement_weight: 0.4,
        implementation_difficulty_weight: 0.3,
        user_impact_weight: 0.3,
      })
    ).toThrow(/スコア/);

    // エラーテスト: 加重値が負の値
    expect(() =>
      calculatePriorityScore({
        performance_improvement_score: 80,
        implementation_difficulty_score: 60,
        user_impact_score: 75,
        performance_improvement_weight: -0.1,
        implementation_difficulty_weight: 0.5,
        user_impact_weight: 0.6,
      })
    ).toThrow(/加重値/);
  });
});