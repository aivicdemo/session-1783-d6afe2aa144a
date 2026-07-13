import { calculateComprehensivePriorityScore } from '../../src/logic/it-3-br-6-3-3';

describe('改善提案書生成時の要因別スコアリング', () => {
  // SCEN-291
  test('影響度スコアと実装可能性スコアから総合優先度スコアが正しく算出される', () => {
    // ハッピーパス: 標準的な入力値（影響度: 8、実装可能性: 7）
    const standard_result = calculateComprehensivePriorityScore({
      impact_score: 8,
      implementation_feasibility_score: 7,
    });
    // 計算式: 影響度 × 0.6 + 実装可能性 × 0.4 = 8 × 0.6 + 7 × 0.4 = 4.8 + 2.8 = 7.6
    expect(standard_result).toBe(7.6);

    // 最高値ケース: 両方満点（影響度: 10、実装可能性: 10）
    const max_result = calculateComprehensivePriorityScore({
      impact_score: 10,
      implementation_feasibility_score: 10,
    });
    // 計算式: 10 × 0.6 + 10 × 0.4 = 6 + 4 = 10
    expect(max_result).toBe(10);

    // 最低値ケース: 両方最小（影響度: 1、実装可能性: 1）
    const min_result = calculateComprehensivePriorityScore({
      impact_score: 1,
      implementation_feasibility_score: 1,
    });
    // 計算式: 1 × 0.6 + 1 × 0.4 = 0.6 + 0.4 = 1
    expect(min_result).toBe(1);

    // 中間値ケース（影響度: 5、実装可能性: 5）
    const mid_result = calculateComprehensivePriorityScore({
      impact_score: 5,
      implementation_feasibility_score: 5,
    });
    // 計算式: 5 × 0.6 + 5 × 0.4 = 3 + 2 = 5
    expect(mid_result).toBe(5);

    // 端数処理ケース1: 影響度優位（影響度: 9、実装可能性: 3）
    const impact_dominant = calculateComprehensivePriorityScore({
      impact_score: 9,
      implementation_feasibility_score: 3,
    });
    // 計算式: 9 × 0.6 + 3 × 0.4 = 5.4 + 1.2 = 6.6
    expect(impact_dominant).toBe(6.6);

    // 端数処理ケース2: 実装可能性優位（影響度: 2、実装可能性: 8）
    const feasibility_dominant = calculateComprehensivePriorityScore({
      impact_score: 2,
      implementation_feasibility_score: 8,
    });
    // 計算式: 2 × 0.6 + 8 × 0.4 = 1.2 + 3.2 = 4.4
    expect(feasibility_dominant).toBe(4.4);

    // 小数点以下の丸め確認（影響度: 7、実装可能性: 6）
    const rounding_case = calculateComprehensivePriorityScore({
      impact_score: 7,
      implementation_feasibility_score: 6,
    });
    // 計算式: 7 × 0.6 + 6 × 0.4 = 4.2 + 2.4 = 6.6
    expect(rounding_case).toBe(6.6);

    // 不均衡な組み合わせ（影響度: 10、実装可能性: 1）
    const unbalanced_high_impact = calculateComprehensivePriorityScore({
      impact_score: 10,
      implementation_feasibility_score: 1,
    });
    // 計算式: 10 × 0.6 + 1 × 0.4 = 6 + 0.4 = 6.4
    expect(unbalanced_high_impact).toBe(6.4);

    // 不均衡な組み合わせ（影響度: 1、実装可能性: 10）
    const unbalanced_high_feasibility = calculateComprehensivePriorityScore({
      impact_score: 1,
      implementation_feasibility_score: 10,
    });
    // 計算式: 1 × 0.6 + 10 × 0.4 = 0.6 + 4 = 4.6
    expect(unbalanced_high_feasibility).toBe(4.6);
  });
});