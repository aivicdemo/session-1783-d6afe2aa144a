import { calculateAlgorithmImprovementDegree } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善前後効果比較機能', () => {
  // SCEN-671
  test('改善前後で同一指標が0値の場合、改善度計算が正確に行われる', () => {
    // テストデータ: 改善前アルゴリズムの指標値を0に設定
    const preAlgorithmMetrics = {
      success_rate: 0,
      cooking_time_reduction: 0,
      user_satisfaction_score: 0,
    };

    // テストデータ: 改善後アルゴリズムの指標値も0に設定
    const postAlgorithmMetrics = {
      success_rate: 0,
      cooking_time_reduction: 0,
      user_satisfaction_score: 0,
    };

    // 改善度計算機能に両方のアルゴリズムデータを入力して実行
    const result = calculateAlgorithmImprovementDegree(
      preAlgorithmMetrics,
      postAlgorithmMetrics
    );

    // 計算結果の数値型と値を検証
    expect(typeof result.improvement_degree).toBe('number');
    expect(typeof result.is_calculable).toBe('boolean');

    // 計算結果がNaN、Infinity、undefinedでないことを確認
    expect(Number.isNaN(result.improvement_degree)).toBe(false);
    expect(Number.isFinite(result.improvement_degree)).toBe(true);
    expect(result.improvement_degree).not.toBeUndefined();

    // 計算結果がゼロ除算エラーを発生させていないことを確認
    // 改善前後の指標値が共に0の場合、改善度計算は0を返すか、適切なエラーハンドリングにより計算不可状態を返すこと
    if (result.is_calculable === false) {
      expect(result.improvement_degree).toBe(0);
    } else {
      expect(result.improvement_degree).toBe(0);
    }
  });
});