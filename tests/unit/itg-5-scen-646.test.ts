import { calculateImprovementEffectProspect } from '../../src/logic/it-7-2-1';

describe('IT-7-2-1: アルゴリズム改善検証基準判定機能 - 改善効果の見込み度算出', () => {
  // SCEN-646: [normal] アルゴリズム改善検証基準判定機能 - 改善効果の見込み度が正確に算出・出力される
  test('改善効果の見込み度を0～100%範囲で正確に算出し、複数入力パターンで一貫性を確保する', () => {
    // ケース1: 改善前後で大幅改善（最大値パターン）
    // 改善前: 精度70%, 処理速度2.5秒, リソース使用率85%
    // 改善後: 精度92%, 処理速度1.2秒, リソース使用率62%
    // 期待計算: 
    //   - 精度改善度: (92-70)/70 = 31.43%
    //   - 処理速度改善度: (2.5-1.2)/2.5 = 52%
    //   - リソース改善度: (85-62)/85 = 27.06%
    //   - 平均改善効果: (31.43 + 52 + 27.06) / 3 = 36.83%
    const result1 = calculateImprovementEffectProspect({
      before_accuracy: 70,
      after_accuracy: 92,
      before_processing_time_sec: 2.5,
      after_processing_time_sec: 1.2,
      before_resource_usage_percent: 85,
      after_resource_usage_percent: 62,
    });
    expect(result1).toBeCloseTo(36.83, 1);
    expect(result1).toBeGreaterThanOrEqual(0);
    expect(result1).toBeLessThanOrEqual(100);

    // ケース2: 改善がない（最小値パターン）
    // 改善前後で数値が同一
    // 期待計算: 改善度は0%
    const result2 = calculateImprovementEffectProspect({
      before_accuracy: 80,
      after_accuracy: 80,
      before_processing_time_sec: 2.0,
      after_processing_time_sec: 2.0,
      before_resource_usage_percent: 75,
      after_resource_usage_percent: 75,
    });
    expect(result2).toBeCloseTo(0, 1);
    expect(result2).toBeGreaterThanOrEqual(0);
    expect(result2).toBeLessThanOrEqual(100);

    // ケース3: 中間レベルの改善（中間値パターン）
    // 改善前: 精度75%, 処理速度2.0秒, リソース使用率80%
    // 改善後: 精度83%, 処理速度1.6秒, リソース使用率72%
    // 期待計算:
    //   - 精度改善度: (83-75)/75 = 10.67%
    //   - 処理速度改善度: (2.0-1.6)/2.0 = 20%
    //   - リソース改善度: (80-72)/80 = 10%
    //   - 平均改善効果: (10.67 + 20 + 10) / 3 = 13.56%
    const result3 = calculateImprovementEffectProspect({
      before_accuracy: 75,
      after_accuracy: 83,
      before_processing_time_sec: 2.0,
      after_processing_time_sec: 1.6,
      before_resource_usage_percent: 80,
      after_resource_usage_percent: 72,
    });
    expect(result3).toBeCloseTo(13.56, 1);
    expect(result3).toBeGreaterThanOrEqual(0);
    expect(result3).toBeLessThanOrEqual(100);

    // ケース4: 改善が部分的に負（逆効果）
    // 改善前: 精度80%, 処理速度1.5秒, リソース使用率70%
    // 改善後: 精度85%, 処理速度1.8秒, リソース使用率68%
    // 期待計算:
    //   - 精度改善度: (85-80)/80 = 6.25%
    //   - 処理速度改善度: (1.5-1.8)/1.5 = -20% （悪化）
    //   - リソース改善度: (70-68)/70 = 2.86%
    //   - 平均改善効果: (6.25 + (-20) + 2.86) / 3 = -3.63%
    // 範囲内（0以上100以下）なら0に補正される可能性あり、または負の値を返す設計次第
    const result4 = calculateImprovementEffectProspect({
      before_accuracy: 80,
      after_accuracy: 85,
      before_processing_time_sec: 1.5,
      after_processing_time_sec: 1.8,
      before_resource_usage_percent: 70,
      after_resource_usage_percent: 68,
    });
    expect(result4).toBeGreaterThanOrEqual(0);
    expect(result4).toBeLessThanOrEqual(100);

    // ケース5: 極めて小さい改善（精度検証用）
    // 改善前: 精度80%, 処理速度2.0秒, リソース使用率75%
    // 改善後: 精度80.5%, 処理速度1.99秒, リソース使用率74.8%
    // 期待計算:
    //   - 精度改善度: (80.5-80)/80 = 0.625%
    //   - 処理速度改善度: (2.0-1.99)/2.0 = 0.5%
    //   - リソース改善度: (75-74.8)/75 = 0.267%
    //   - 平均改善効果: (0.625 + 0.5 + 0.267) / 3 = 0.46%
    const result5 = calculateImprovementEffectProspect({
      before_accuracy: 80,
      after_accuracy: 80.5,
      before_processing_time_sec: 2.0,
      after_processing_time_sec: 1.99,
      before_resource_usage_percent: 75,
      after_resource_usage_percent: 74.8,
    });
    expect(result5).toBeCloseTo(0.46, 1);
    expect(result5).toBeGreaterThanOrEqual(0);
    expect(result5).toBeLessThanOrEqual(100);

    // ケース6: すべての指標で大幅改善（満点に近い）
    // 改善前: 精度60%, 処理速度3.0秒, リソース使用率90%
    // 改善後: 精度95%, 処理速度0.5秒, リソース使用率40%
    // 期待計算:
    //   - 精度改善度: (95-60)/60 = 58.33%
    //   - 処理速度改善度: (3.0-0.5)/3.0 = 83.33%
    //   - リソース改善度: (90-40)/90 = 55.56%
    //   - 平均改善効果: (58.33 + 83.33 + 55.56) / 3 = 65.74%
    const result6 = calculateImprovementEffectProspect({
      before_accuracy: 60,
      after_accuracy: 95,
      before_processing_time_sec: 3.0,
      after_processing_time_sec: 0.5,
      before_resource_usage_percent: 90,
      after_resource_usage_percent: 40,
    });
    expect(result6).toBeCloseTo(65.74, 1);
    expect(result6).toBeGreaterThanOrEqual(0);
    expect(result6).toBeLessThanOrEqual(100);

    // エラーケース: before_accuracy が 0 の場合（ゼロ除算防止）
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: 0,
        after_accuracy: 50,
        before_processing_time_sec: 2.0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: 80,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/精度|before/);

    // エラーケース: before_processing_time_sec が 0 の場合（ゼロ除算防止）
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: 80,
        after_accuracy: 85,
        before_processing_time_sec: 0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: 80,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/処理速度|before/);

    // エラーケース: before_resource_usage_percent が 0 の場合（ゼロ除算防止）
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: 80,
        after_accuracy: 85,
        before_processing_time_sec: 2.0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: 0,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/リソース|before/);

    // エラーケース: 負の精度値
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: -10,
        after_accuracy: 50,
        before_processing_time_sec: 2.0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: 80,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/精度|負/);

    // エラーケース: 精度が100を超える
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: 150,
        after_accuracy: 160,
        before_processing_time_sec: 2.0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: 80,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/精度|範囲/);

    // エラーケース: リソース使用率が負の値
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: 80,
        after_accuracy: 85,
        before_processing_time_sec: 2.0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: -5,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/リソース|負/);

    // エラーケース: 処理速度が負の値
    expect(() =>
      calculateImprovementEffectProspect({
        before_accuracy: 80,
        after_accuracy: 85,
        before_processing_time_sec: -1.0,
        after_processing_time_sec: 1.5,
        before_resource_usage_percent: 80,
        after_resource_usage_percent: 70,
      })
    ).toThrow(/処理速度|負/);
  });
});