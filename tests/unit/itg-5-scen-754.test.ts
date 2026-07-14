import { judgeAlgorithmImprovement } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善判定機能 - 予測精度が閾値以上の場合', () => {
  // SCEN-754: [normal] アルゴリズム改善判定機能 - 予測精度が閾値以上の場合、改善見送りが判定される
  test('予測精度が閾値以上（90%）の場合、改善判定結果が「改善見送り」となる', () => {
    // 初期化: 予測精度の閾値を設定
    const accuracy_threshold = 85;
    
    // 入力: 閾値以上の予測精度データ
    const input_accuracy = 90;
    
    // 実行: 改善判定処理
    const result = judgeAlgorithmImprovement({
      accuracy: input_accuracy,
      threshold: accuracy_threshold,
    });
    
    // 期待結果: 改善判定結果が「改善見送り」
    expect(result.judgment).toBe('見送り');
    expect(result.should_improve).toBe(false);
    expect(result.accuracy_met_threshold).toBe(true);
  });
});