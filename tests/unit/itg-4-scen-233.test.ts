import { determineImprovementJudgment } from '../../src/logic/it-2-br-6-3-2';

describe('需要予測精度改善判定機能 - 乖離率境界値判定', () => {
  // SCEN-233
  test('乖離率がちょうど閾値の境界値で改善判定が正確に分岐する', () => {
    // ===== 乖離率 4.99% のケース（改善と判定されることを確認）
    const result_4_99 = determineImprovementJudgment({
      divergence_rate: 4.99,
      threshold: 5.0,
    });
    expect(result_4_99).toEqual({
      judgment: '改善',
      divergence_rate: 4.99,
      threshold: 5.0,
      is_exceeded: false,
    });

    // ===== 乖離率ちょうど 5.0% のケース（改善と判定されることを確認）
    const result_5_00 = determineImprovementJudgment({
      divergence_rate: 5.0,
      threshold: 5.0,
    });
    expect(result_5_00).toEqual({
      judgment: '改善',
      divergence_rate: 5.0,
      threshold: 5.0,
      is_exceeded: false,
    });

    // ===== 乖離率 5.01% のケース（未改善と判定されることを確認）
    const result_5_01 = determineImprovementJudgment({
      divergence_rate: 5.01,
      threshold: 5.0,
    });
    expect(result_5_01).toEqual({
      judgment: '未改善',
      divergence_rate: 5.01,
      threshold: 5.0,
      is_exceeded: true,
    });

    // ===== 低リスク境界：乖離率 0.0% のケース
    const result_0_00 = determineImprovementJudgment({
      divergence_rate: 0.0,
      threshold: 5.0,
    });
    expect(result_0_00).toEqual({
      judgment: '改善',
      divergence_rate: 0.0,
      threshold: 5.0,
      is_exceeded: false,
    });

    // ===== 高リスク境界：乖離率 10.0% のケース
    const result_10_00 = determineImprovementJudgment({
      divergence_rate: 10.0,
      threshold: 5.0,
    });
    expect(result_10_00).toEqual({
      judgment: '未改善',
      divergence_rate: 10.0,
      threshold: 5.0,
      is_exceeded: true,
    });

    // ===== エラーケース：負の乖離率
    expect(() =>
      determineImprovementJudgment({
        divergence_rate: -1.0,
        threshold: 5.0,
      })
    ).toThrow(/乖離率/);

    // ===== エラーケース：負の閾値
    expect(() =>
      determineImprovementJudgment({
        divergence_rate: 5.0,
        threshold: -5.0,
      })
    ).toThrow(/閾値/);

    // ===== エラーケース：乖離率が null
    expect(() =>
      determineImprovementJudgment({
        divergence_rate: null as any,
        threshold: 5.0,
      })
    ).toThrow(/乖離率/);

    // ===== エラーケース：閾値が undefined
    expect(() =>
      determineImprovementJudgment({
        divergence_rate: 5.0,
        threshold: undefined as any,
      })
    ).toThrow(/閾値/);
  });
});