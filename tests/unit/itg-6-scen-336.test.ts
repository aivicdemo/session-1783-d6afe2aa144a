import {
  detectContradictionBetweenInterviewAndLog,
} from "../../src/logic/it-8-1-2-1";

describe("献立生成フロー内の制約条件入力パターンと離脱ポイントの自動抽出・可視化", () => {
  // SCEN-336
  test("インタビュー記録とログデータの矛盾検出機能 - ペイン要因の発生頻度差がちょうど閾値の境界値で矛盾と判定される", () => {
    // 設定: 矛盾判定の閾値を10回に定義
    const CONTRADICTION_THRESHOLD = 10;

    // インタビュー記録: ペイン要因Aの発生頻度が「高い」と記載
    const interview_record = {
      user_id: "user_001",
      pain_factor_key: "pain_factor_a",
      subjective_frequency: "高い",
      recorded_at: "2024-01-15T09:00:00Z",
    };

    // ログデータ: ペイン要因Aの発生回数をちょうど閾値の10回に設定（境界値）
    const log_data = {
      user_id: "user_001",
      pain_factor_key: "pain_factor_a",
      occurrence_count: 10,
      period_start: "2024-01-01T00:00:00Z",
      period_end: "2024-01-31T23:59:59Z",
    };

    // 矛盾検出機能を実行
    const result = detectContradictionBetweenInterviewAndLog({
      interview: interview_record,
      log: log_data,
      contradiction_threshold: CONTRADICTION_THRESHOLD,
    });

    // 期待結果の検証
    // 1. 矛盾判定結果が正しく返却されることを確認
    expect(result).toHaveProperty("has_contradiction");
    expect(typeof result.has_contradiction).toBe("boolean");

    // 2. インタビュー主観値「高い」とログ客観値（10回）の比較結果
    // 「高い」 = 発生頻度が高い = ログ発生回数が多い（≥閾値）と期待される
    // ログ発生回数が10回（ちょうど閾値）の場合、「高い」という主観表現と整合していると判定
    // 矛盾フラグは false（矛盾なし）
    expect(result.has_contradiction).toBe(false);

    // 3. 矛盾判定の根拠が記録されることを確認
    expect(result).toHaveProperty("contradiction_reason");
    expect(typeof result.contradiction_reason).toBe("string");

    // 4. 矛盾度スコアが返却されることを確認（0～100の範囲）
    expect(result).toHaveProperty("contradiction_score");
    expect(typeof result.contradiction_score).toBe("number");
    expect(result.contradiction_score).toBeGreaterThanOrEqual(0);
    expect(result.contradiction_score).toBeLessThanOrEqual(100);

    // 5. 閾値境界値の場合、矛盾度スコアは低い（0に近い）ことを期待
    // ペイン要因Aの発生回数がちょうど閾値と等しいため、矛盾度は最小
    expect(result.contradiction_score).toBe(0);

    // 6. 信頼度情報が付与されることを確認
    expect(result).toHaveProperty("data_reliability_level");
    expect(["high", "medium", "low"]).toContain(
      result.data_reliability_level
    );

    // 7. インタビュー記録のユーザーIDと対象ペイン要因が正しく紐付けられていることを確認
    expect(result).toHaveProperty("user_id");
    expect(result.user_id).toBe("user_001");
    expect(result).toHaveProperty("pain_factor_key");
    expect(result.pain_factor_key).toBe("pain_factor_a");

    // 8. 分析対象期間が正しく記録されることを確認
    expect(result).toHaveProperty("analysis_period_start");
    expect(result).toHaveProperty("analysis_period_end");
    expect(result.analysis_period_start).toBe("2024-01-01T00:00:00Z");
    expect(result.analysis_period_end).toBe("2024-01-31T23:59:59Z");
  });
});