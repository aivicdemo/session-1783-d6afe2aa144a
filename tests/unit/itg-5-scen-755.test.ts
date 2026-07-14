import { determineAlgorithmImprovement } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善判定機能 - 予測精度が閾値と完全一致した場合の判定', () => {
  test('SCEN-755: 予測精度が閾値と完全一致した場合、改善判定が明確に決定される', async () => {
    // Setup: 予測精度が閾値と完全一致するテストデータを準備
    const accuracy_threshold = 85.0;
    const algorithm_version = 'v2.1.0';
    const prediction_accuracy = 85.0; // 閾値と完全一致
    const previous_success_rate = 0.78;
    const current_success_rate = 0.85;
    const previous_satisfaction_score = 3.2;
    const current_satisfaction_score = 3.7;
    const previous_cooking_time_reduction = 0.12;
    const current_cooking_time_reduction = 0.18;

    const request_payload = {
      algorithm_version,
      prediction_accuracy,
      accuracy_threshold,
      previous_success_rate,
      current_success_rate,
      previous_satisfaction_score,
      current_satisfaction_score,
      previous_cooking_time_reduction,
      current_cooking_time_reduction,
    };

    // Act: 改善判定処理を実行
    const result = await determineAlgorithmImprovement(request_payload);

    // Assert: ステータスコード検証
    expect(result.status_code).toBe(200);

    // Assert: 改善判定フラグが Boolean 型で返却されることを確認
    expect(typeof result.improvement_flag).toBe('boolean');

    // Assert: 改善判定フラグが true（改善と判定）であることを確認
    // 理由: 予測精度が閾値に達し、成功率・満足度・調理時間短縮度すべてが改善しているため
    expect(result.improvement_flag).toBe(true);

    // Assert: 判定理由メッセージが明確に記載されていることを検証
    expect(result.improvement_reason).toBeDefined();
    expect(result.improvement_reason).toBeTruthy();
    expect(result.improvement_reason.length).toBeGreaterThan(0);

    // Assert: 判定理由に期待される業務キーワードが含まれていることを確認
    expect(result.improvement_reason).toMatch(/予測精度|閾値|達成/);

    // Assert: 判定詳細情報が含まれていることを検証
    expect(result).toHaveProperty('accuracy_match_status');
    expect(result.accuracy_match_status).toBe('threshold_exactly_met');

    // Assert: 各指標の改善度を検証
    expect(result.success_rate_improvement).toBe(
      current_success_rate - previous_success_rate
    );
    expect(result.satisfaction_score_improvement).toBe(
      current_satisfaction_score - previous_satisfaction_score
    );
    expect(result.cooking_time_reduction_improvement).toBe(
      current_cooking_time_reduction - previous_cooking_time_reduction
    );

    // Assert: 改善度の期待値を検証
    expect(result.success_rate_improvement).toBe(0.07);
    expect(result.satisfaction_score_improvement).toBe(0.5);
    expect(result.cooking_time_reduction_improvement).toBe(0.06);

    // Assert: 改善判定根拠スコアが計算されていることを確認
    expect(result).toHaveProperty('overall_improvement_score');
    expect(typeof result.overall_improvement_score).toBe('number');
    expect(result.overall_improvement_score).toBeGreaterThan(0);
    expect(result.overall_improvement_score).toBeLessThanOrEqual(100);

    // Assert: タイムスタンプが ISO 形式で記録されていることを確認
    expect(result).toHaveProperty('evaluation_timestamp');
    expect(result.evaluation_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/
    );

    // Assert: アルゴリズムバージョンが結果に含まれていることを確認
    expect(result.algorithm_version).toBe(algorithm_version);
  });
});