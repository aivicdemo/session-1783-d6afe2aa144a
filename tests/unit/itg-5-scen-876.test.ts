import { calculateAlgorithmImprovementEffect } from '../../src/logic/it-7-2-1';

describe('献立生成成功率の改善効果判定ダッシュボード', () => {
  // SCEN-876
  test('改善後の成功率が最小閾値以上かつ改善目標値に対して進捗状況が正判定される', () => {
    // 【前提】改善前後の献立生成成功率と改善目標値がシステムに設定されている
    // 【発生条件】アルゴリズム改善検証ダッシュボードで改善効果判定画面にアクセス
    // 【期待結果】改善後の成功率が最小閾値以上であり、進捗状況が正判定として表示される

    // 改善前後のパラメータ定義
    const beforeSuccessRate = 72.5; // 改善前成功率: 72.5%
    const afterSuccessRate = 78.8; // 改善後成功率: 78.8%
    const minimumThreshold = 75.0; // 最小閾値: 75.0%
    const improvementTargetRate = 5.0; // 改善目標値: 5.0ポイント以上の向上

    // 改善効果判定関数を呼び出し
    const result = calculateAlgorithmImprovementEffect({
      beforeSuccessRate,
      afterSuccessRate,
      minimumThreshold,
      improvementTargetRate,
    });

    // 【検証1】改善後の成功率が最小閾値以上であることを確認
    expect(afterSuccessRate).toBeGreaterThanOrEqual(minimumThreshold);

    // 【検証2】改善後の成功率が改善前より向上していることを確認
    const improvementDifference = afterSuccessRate - beforeSuccessRate;
    expect(improvementDifference).toBeGreaterThan(0);

    // 【検証3】改善差分が改善目標値に対する進捗パーセンテージを計算
    const progressPercentage = (improvementDifference / improvementTargetRate) * 100;
    // 期待値: (78.8 - 72.5) / 5.0 * 100 = 6.3 / 5.0 * 100 = 126%
    expect(progressPercentage).toBe(126);

    // 【検証4】判定結果が正判定（達成状況が"達成中"または"目標達成"）であることを確認
    expect(result.isThresholdMet).toBe(true); // 最小閾値達成
    expect(result.progressStatus).toBe('達成中'); // 進捗状況は"達成中"
    expect(result.progressPercentage).toBe(126); // 進捗が目標値の126%
    expect(result.isImprovementValid).toBe(true); // 改善が有効判定

    // 【検証5】改善効果を定量比較した結果が構造化データとして返されること
    expect(result).toEqual({
      beforeSuccessRate: 72.5,
      afterSuccessRate: 78.8,
      minimumThreshold: 75.0,
      improvementTargetRate: 5.0,
      improvementDifference: 6.3,
      progressPercentage: 126,
      isThresholdMet: true,
      progressStatus: '達成中',
      isImprovementValid: true,
      recommendedAction: '改善効果を本番反映へ進める',
    });

    // 【検証6】ダッシュボード表示用の定量指標が正確に集計されていることを確認
    expect(result.improvementDifference).toBeCloseTo(6.3, 1);
    expect(result.isThresholdMet).toBe(true);
    expect(typeof result.progressPercentage).toBe('number');
    expect(result.progressStatus).toMatch(/達成中|目標達成/);
  });
});