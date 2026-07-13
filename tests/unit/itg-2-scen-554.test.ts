import { evaluateAlgorithmImprovementNecessity } from '../../src/logic/it-1-br-2-1-1-1';

describe('需要予測精度改善判定機能', () => {
  // SCEN-554
  test('乖離率が閾値以下のとき改善見送り判定が返される', () => {
    // Setup: 乖離率が閾値以下のテストデータ
    const predicted_demand = 100;
    const actual_demand = 98;
    const divergence_threshold = 0.05; // 5%

    // 乖離率計算: (|予測値 - 実績値| / 実績値) * 100
    const divergence_rate = (Math.abs(predicted_demand - actual_demand) / actual_demand);
    // 期待される乖離率: (|100 - 98| / 98) ≈ 0.0204 (2.04%)

    // Execute: 改善判定関数を呼び出し
    const result = evaluateAlgorithmImprovementNecessity({
      predicted_demand,
      actual_demand,
      divergence_threshold,
    });

    // Assert: 乖離率が閾値以下の場合、改善見送り判定
    expect(result.improvement_needed).toBe(false);
    expect(result.status).toBe('no_improvement_required');
    expect(result.divergence_rate).toBeCloseTo(0.0204, 4);
    expect(result.message).toContain('改善');
  });
});