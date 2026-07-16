import { generateImprovementProposal } from "../../src/logic/it-8-1-1-1";

describe("ユーザーペイン分析・改善提案書生成", () => {
  // SCEN-216
  test("改善提案書が開発チーム指定の標準フォーマットで正しく出力される", () => {
    // Arrange: ユーザーペイン分析データと差別化軸検証結果を準備
    const painAnalysisInput = {
      interviewRecords: [
        {
          userId: "user_001",
          segmentType: "stay_home_father",
          painFactors: [
            {
              category: "food_restriction",
              frequency: 15,
              impact: 8,
              description: "アレルギー対応献立の手間",
            },
            {
              category: "cooking_time_limit",
              frequency: 22,
              impact: 9,
              description: "30分以内の調理時間制約",
            },
            {
              category: "budget_constraint",
              frequency: 18,
              impact: 7,
              description: "月3万円の食費予算制限",
            },
          ],
          timestamp: "2024-01-15T09:00:00Z",
        },
      ],
      appUsageLogs: [
        {
          userId: "user_001",
          featureName: "dietary_restriction_filter",
          usageCount: 45,
          abandonmentRate: 0.12,
          timestamp: "2024-01-15T10:30:00Z",
        },
        {
          userId: "user_001",
          featureName: "quick_menu_generation",
          usageCount: 38,
          abandonmentRate: 0.08,
          timestamp: "2024-01-15T10:31:00Z",
        },
      ],
      differentiation_axes: [
        {
          axis_name: "食材制限対応の自動化",
          competitive_gap_score: 45,
          priority_rank: 1,
        },
        {
          axis_name: "調理時間短縮ロジック",
          competitive_gap_score: 38,
          priority_rank: 2,
        },
      ],
      analysis_period: {
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      },
    };

    // Act: 改善提案書生成処理を実行
    const generatedProposal = generateImprovementProposal(painAnalysisInput);

    // Assert: フォーマット構造の検証（JSON形式）
    expect(generatedProposal).toBeDefined();
    expect(typeof generatedProposal).toBe("object");

    // 必須項目が全て含まれることを確認
    expect(generatedProposal).toHaveProperty("title");
    expect(generatedProposal).toHaveProperty("summary");
    expect(generatedProposal).toHaveProperty("detail_content");
    expect(generatedProposal).toHaveProperty("implementation_plan");
    expect(generatedProposal).toHaveProperty("expected_effects");
    expect(generatedProposal).toHaveProperty("format_version");
    expect(generatedProposal).toHaveProperty("encoding");
    expect(generatedProposal).toHaveProperty("generated_timestamp");

    // タイトルの内容検証
    expect(generatedProposal.title).toBe(
      "専業主夫層向け食材制限・調理時間短縮対応の改善提案"
    );

    // サマリーの検証
    expect(generatedProposal.summary).toBeDefined();
    expect(typeof generatedProposal.summary).toBe("string");
    expect(generatedProposal.summary.length).toBeGreaterThan(50);

    // 詳細内容の検証（ペイン要因の優先度を含む）
    expect(generatedProposal.detail_content).toBeDefined();
    expect(typeof generatedProposal.detail_content).toBe("object");
    expect(generatedProposal.detail_content).toHaveProperty("pain_factors");
    expect(Array.isArray(generatedProposal.detail_content.pain_factors)).toBe(
      true
    );
    expect(generatedProposal.detail_content.pain_factors.length).toBe(3);

    // ペイン要因が優先度順にソートされていることを確認
    const painFactors = generatedProposal.detail_content.pain_factors;
    expect(painFactors[0].category).toBe("cooking_time_limit");
    expect(painFactors[0].frequency).toBe(22);
    expect(painFactors[0].impact).toBe(9);
    expect(painFactors[0].priority_score).toBe(198); // 22 * 9 = 198

    expect(painFactors[1].category).toBe("food_restriction");
    expect(painFactors[1].frequency).toBe(15);
    expect(painFactors[1].impact).toBe(8);
    expect(painFactors[1].priority_score).toBe(120); // 15 * 8 = 120

    expect(painFactors[2].category).toBe("budget_constraint");
    expect(painFactors[2].frequency).toBe(18);
    expect(painFactors[2].impact).toBe(7);
    expect(painFactors[2].priority_score).toBe(126); // 18 * 7 = 126

    // 実装計画の検証
    expect(generatedProposal.implementation_plan).toBeDefined();
    expect(typeof generatedProposal.implementation_plan).toBe("object");
    expect(generatedProposal.implementation_plan).toHaveProperty("phase_1");
    expect(generatedProposal.implementation_plan).toHaveProperty("phase_2");
    expect(generatedProposal.implementation_plan).toHaveProperty(
      "estimated_completion_date"
    );

    // 期待効果の検証
    expect(generatedProposal.expected_effects).toBeDefined();
    expect(typeof generatedProposal.expected_effects).toBe("object");
    expect(generatedProposal.expected_effects).toHaveProperty(
      "user_satisfaction_improvement"
    );
    expect(generatedProposal.expected_effects).toHaveProperty(
      "feature_usage_increase"
    );
    expect(generatedProposal.expected_effects).toHaveProperty(
      "abandonment_rate_reduction"
    );

    expect(generatedProposal.expected_effects.user_satisfaction_improvement).toBe(
      25
    );
    expect(
      generatedProposal.expected_effects.feature_usage_increase
    ).toBe(35);
    expect(
      generatedProposal.expected_effects.abandonment_rate_reduction
    ).toBe(40);

    // フォーマットバージョンの検証
    expect(generatedProposal.format_version).toBe("1.0");

    // エンコーディングの検証（UTF-8）
    expect(generatedProposal.encoding).toBe("UTF-8");

    // タイムスタンプの検証（ISO 8601形式）
    expect(generatedProposal.generated_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 差別化軸が反映されていることを確認
    expect(generatedProposal.detail_content).toHaveProperty(
      "differentiation_axes"
    );
    expect(
      Array.isArray(generatedProposal.detail_content.differentiation_axes)
    ).toBe(true);
    expect(
      generatedProposal.detail_content.differentiation_axes.length
    ).toBe(2);
    expect(
      generatedProposal.detail_content.differentiation_axes[0].axis_name
    ).toBe("食材制限対応の自動化");
    expect(
      generatedProposal.detail_content.differentiation_axes[0]
        .competitive_gap_score
    ).toBe(45);

    // 開発チームへの提出可能性確認（構造の整合性）
    expect(generatedProposal).toHaveProperty("team_submission_ready");
    expect(generatedProposal.team_submission_ready).toBe(true);

    // 全ての必須フィールドがnullやundefinedでないことを確認
    expect(generatedProposal.title).not.toBeNull();
    expect(generatedProposal.summary).not.toBeNull();
    expect(generatedProposal.detail_content).not.toBeNull();
    expect(generatedProposal.implementation_plan).not.toBeNull();
    expect(generatedProposal.expected_effects).not.toBeNull();

    // 分析期間が正しく記録されていることを確認
    expect(generatedProposal.detail_content).toHaveProperty("analysis_period");
    expect(generatedProposal.detail_content.analysis_period.start_date).toBe(
      "2024-01-01"
    );
    expect(generatedProposal.detail_content.analysis_period.end_date).toBe(
      "2024-01-31"
    );
  });
});