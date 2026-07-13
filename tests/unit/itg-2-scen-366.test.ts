import { calculateDeviationRate, generateImprovement } from '../../src/logic/it-1-br-2-1-1-1';

describe('需要予測精度の乖離分析と自動改善提案生成', () => {
  // SCEN-366
  test('予測値と実績値の乖離度が正しく計算される', () => {
    // ハッピーパス: 正の乖離（実績 < 予測）
    const deviation_positive = calculateDeviationRate({
      predicted_demand: 100,
      actual_demand: 95,
    });
    expect(deviation_positive).toBe(5);

    // ハッピーパス: 負の乖離（実績 > 予測）
    const deviation_negative = calculateDeviationRate({
      predicted_demand: 100,
      actual_demand: 105,
    });
    expect(deviation_negative).toBe(-5);

    // ハッピーパス: ゼロ乖離
    const deviation_zero = calculateDeviationRate({
      predicted_demand: 100,
      actual_demand: 100,
    });
    expect(deviation_zero).toBe(0);

    // ハッピーパス: 大きな正の乖離
    const deviation_large_positive = calculateDeviationRate({
      predicted_demand: 100,
      actual_demand: 50,
    });
    expect(deviation_large_positive).toBe(50);

    // ハッピーパス: 大きな負の乖離
    const deviation_large_negative = calculateDeviationRate({
      predicted_demand: 100,
      actual_demand: 150,
    });
    expect(deviation_large_negative).toBe(-50);

    // ハッピーパス: 小数値の乖離
    const deviation_decimal = calculateDeviationRate({
      predicted_demand: 100,
      actual_demand: 97.5,
    });
    expect(deviation_decimal).toBe(2.5);

    // エラー: 予測値がゼロの場合
    expect(() =>
      calculateDeviationRate({
        predicted_demand: 0,
        actual_demand: 50,
      })
    ).toThrow(/予測値/);

    // エラー: 予測値が負の場合
    expect(() =>
      calculateDeviationRate({
        predicted_demand: -100,
        actual_demand: 95,
      })
    ).toThrow(/予測値/);

    // エラー: 実績値が負の場合
    expect(() =>
      calculateDeviationRate({
        predicted_demand: 100,
        actual_demand: -50,
      })
    ).toThrow(/実績値/);
  });

  test('乖離度に基づいて自動改善提案が生成される', () => {
    // ハッピーパス: 低乖離度（5%以下）は改善提案なし
    const proposal_low = generateImprovement({
      deviation_rate: 3,
      deviation_category: '低乖離',
      prediction_model_version: 'v1.0',
    });
    expect(proposal_low).toEqual({
      should_improve: false,
      priority: null,
      recommendation: null,
    });

    // ハッピーパス: 中程度乖離度（5% ～ 15%）は優先度「中」
    const proposal_medium = generateImprovement({
      deviation_rate: 10,
      deviation_category: '中乖離',
      prediction_model_version: 'v1.0',
    });
    expect(proposal_medium).toEqual({
      should_improve: true,
      priority: 'medium',
      recommendation: '予測モデルのパラメータ調整を検討してください',
    });

    // ハッピーパス: 高乖離度（15%以上）は優先度「高」
    const proposal_high = generateImprovement({
      deviation_rate: 25,
      deviation_category: '高乖離',
      prediction_model_version: 'v1.0',
    });
    expect(proposal_high).toEqual({
      should_improve: true,
      priority: 'high',
      recommendation: '予測モデルの再学習が必要です',
    });

    // ハッピーパス: 境界値5%は改善提案なし
    const proposal_boundary_5 = generateImprovement({
      deviation_rate: 5,
      deviation_category: '低乖離',
      prediction_model_version: 'v1.0',
    });
    expect(proposal_boundary_5).toEqual({
      should_improve: false,
      priority: null,
      recommendation: null,
    });

    // ハッピーパス: 境界値15%は優先度「高」
    const proposal_boundary_15 = generateImprovement({
      deviation_rate: 15,
      deviation_category: '高乖離',
      prediction_model_version: 'v1.0',
    });
    expect(proposal_boundary_15).toEqual({
      should_improve: true,
      priority: 'high',
      recommendation: '予測モデルの再学習が必要です',
    });

    // ハッピーパス: 異なるモデルバージョンでも提案生成される
    const proposal_different_version = generateImprovement({
      deviation_rate: 20,
      deviation_category: '高乖離',
      prediction_model_version: 'v2.1',
    });
    expect(proposal_different_version).toEqual({
      should_improve: true,
      priority: 'high',
      recommendation: '予測モデルの再学習が必要です',
    });

    // エラー: 乖離度がnullの場合
    expect(() =>
      generateImprovement({
        deviation_rate: null as any,
        deviation_category: '中乖離',
        prediction_model_version: 'v1.0',
      })
    ).toThrow(/乖離度/);

    // エラー: deviation_categoryが無効な場合
    expect(() =>
      generateImprovement({
        deviation_rate: 10,
        deviation_category: '無効なカテゴリ' as any,
        prediction_model_version: 'v1.0',
      })
    ).toThrow(/カテゴリ/);

    // エラー: prediction_model_versionが空文字列の場合
    expect(() =>
      generateImprovement({
        deviation_rate: 10,
        deviation_category: '中乖離',
        prediction_model_version: '',
      })
    ).toThrow(/モデルバージョン/);
  });
});