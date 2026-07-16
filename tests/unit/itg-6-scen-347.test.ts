import { calculateAnalysisTrustScore } from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能", () => {
  // SCEN-347
  test("分析結果信頼度判定機能 - 収集データが不足し信頼度スコアが閾値以下のとき、補完すべきデータ種別と補完方法が自動提示される", () => {
    const insufficient_dataset = {
      interview_records_count: 3,
      app_logs_count: 5,
      user_attributes_collected: false,
      behavioral_logs_collected: false,
      purchase_history_collected: false,
      pain_factors: [
        {
          factor_type: "food_restriction",
          frequency: 2,
          impact_score: 3.5,
        },
        {
          factor_type: "cooking_time_restriction",
          frequency: 1,
          impact_score: 2.0,
        },
      ],
      total_required_data_points: 100,
      actual_collected_data_points: 25,
    };

    const trust_score_threshold = 60;

    const result = calculateAnalysisTrustScore({
      dataset: insufficient_dataset,
      threshold: trust_score_threshold,
    });

    // 信頼度スコアが計算される（満たすべき割合が25%のため、低い信頼度スコア）
    expect(result.trust_score).toBe(25);

    // 信頼度スコアが閾値以下であることを確認
    expect(result.trust_score).toBeLessThanOrEqual(trust_score_threshold);

    // 補完が必要であることを示すフラグ
    expect(result.requires_supplementation).toBe(true);

    // 補完すべきデータ種別が正しく特定される
    expect(result.missing_data_types).toContain("user_attributes");
    expect(result.missing_data_types).toContain("behavioral_logs");
    expect(result.missing_data_types).toContain("purchase_history");
    expect(result.missing_data_types.length).toBe(3);

    // 各データ種別に対する補完方法が優先度付きで提示される
    expect(result.supplementation_methods).toBeDefined();
    expect(result.supplementation_methods.length).toBeGreaterThan(0);

    // 補完方法の詳細構造を検証
    const user_attributes_method = result.supplementation_methods.find(
      (method: {
        data_type: string;
        priority: number;
        method_name: string;
        description: string;
        execution_steps: string[];
        required_resources: string[];
        estimated_time_hours: number;
      }) => method.data_type === "user_attributes"
    );

    expect(user_attributes_method).toBeDefined();
    expect(user_attributes_method?.priority).toBe(1);
    expect(user_attributes_method?.method_name).toBe("questionnaire_survey");
    expect(user_attributes_method?.description).toBeDefined();
    expect(user_attributes_method?.execution_steps).toEqual([
      "調査票の設計",
      "対象ユーザーへの配布",
      "回答結果の集計",
      "データの標準化",
    ]);
    expect(user_attributes_method?.required_resources).toEqual([
      "調査ツール",
      "分析担当者",
    ]);
    expect(user_attributes_method?.estimated_time_hours).toBe(24);

    // 行動ログの補完方法を検証
    const behavioral_logs_method = result.supplementation_methods.find(
      (method: { data_type: string; priority: number }) =>
        method.data_type === "behavioral_logs"
    );

    expect(behavioral_logs_method).toBeDefined();
    expect(behavioral_logs_method?.priority).toBe(2);

    // 購買履歴の補完方法を検証
    const purchase_history_method = result.supplementation_methods.find(
      (method: { data_type: string; priority: number }) =>
        method.data_type === "purchase_history"
    );

    expect(purchase_history_method).toBeDefined();
    expect(purchase_history_method?.priority).toBe(3);

    // 補完後の期待信頼度スコア
    expect(result.expected_trust_score_after_supplementation).toBeGreaterThan(
      trust_score_threshold
    );
    expect(result.expected_trust_score_after_supplementation).toBe(85);

    // 次のアクションが明確に示される
    expect(result.recommended_action).toBe(
      "補完方法に従いデータを収集し、再度分析を実行してください"
    );

    // 信頼度スコアが十分な場合（ハッピーパス）のテスト
    const sufficient_dataset = {
      interview_records_count: 50,
      app_logs_count: 500,
      user_attributes_collected: true,
      behavioral_logs_collected: true,
      purchase_history_collected: true,
      pain_factors: [
        {
          factor_type: "food_restriction",
          frequency: 25,
          impact_score: 8.5,
        },
        {
          factor_type: "cooking_time_restriction",
          frequency: 20,
          impact_score: 7.2,
        },
        {
          factor_type: "budget_constraint",
          frequency: 15,
          impact_score: 6.8,
        },
      ],
      total_required_data_points: 100,
      actual_collected_data_points: 95,
    };

    const sufficient_result = calculateAnalysisTrustScore({
      dataset: sufficient_dataset,
      threshold: trust_score_threshold,
    });

    // 信頼度スコアが高い
    expect(sufficient_result.trust_score).toBe(95);

    // 信頼度スコアが閾値以上
    expect(sufficient_result.trust_score).toBeGreaterThanOrEqual(
      trust_score_threshold
    );

    // 補完不要
    expect(sufficient_result.requires_supplementation).toBe(false);

    // 補完方法が提示されない
    expect(sufficient_result.supplementation_methods.length).toBe(0);

    // 分析結果の利用が推奨される
    expect(sufficient_result.recommended_action).toBe(
      "分析結果は信頼性が高く、差別化軸判定に進むことを推奨します"
    );
  });
});