import { calculateExternalFactorPriorityMatrix } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-473
  test("需要予測外部要因変数の優先度マトリクス配置 - 特定された外部要因変数を影響度と実装難度の2軸で優先度マトリクスに配置できる", () => {
    const external_factor_variables = [
      {
        variable_id: "VAR_001",
        variable_name: "季節",
        impact_score: 9,
        implementation_difficulty_score: 3,
      },
      {
        variable_id: "VAR_002",
        variable_name: "天候",
        impact_score: 7,
        implementation_difficulty_score: 5,
      },
      {
        variable_id: "VAR_003",
        variable_name: "イベント",
        impact_score: 8,
        implementation_difficulty_score: 7,
      },
      {
        variable_id: "VAR_004",
        variable_name: "価格変動",
        impact_score: 4,
        implementation_difficulty_score: 2,
      },
      {
        variable_id: "VAR_005",
        variable_name: "競合施策",
        impact_score: 6,
        implementation_difficulty_score: 8,
      },
    ];

    const result = calculateExternalFactorPriorityMatrix(
      external_factor_variables
    );

    expect(result).toEqual({
      quadrant_high_impact_low_difficulty: [
        {
          variable_id: "VAR_001",
          variable_name: "季節",
          impact_score: 9,
          implementation_difficulty_score: 3,
          priority_rank: 1,
          quadrant: "high_impact_low_difficulty",
        },
        {
          variable_id: "VAR_004",
          variable_name: "価格変動",
          impact_score: 4,
          implementation_difficulty_score: 2,
          priority_rank: 3,
          quadrant: "high_impact_low_difficulty",
        },
      ],
      quadrant_high_impact_high_difficulty: [
        {
          variable_id: "VAR_003",
          variable_name: "イベント",
          impact_score: 8,
          implementation_difficulty_score: 7,
          priority_rank: 2,
          quadrant: "high_impact_high_difficulty",
        },
      ],
      quadrant_low_impact_low_difficulty: [
        {
          variable_id: "VAR_002",
          variable_name: "天候",
          impact_score: 7,
          implementation_difficulty_score: 5,
          priority_rank: 4,
          quadrant: "low_impact_low_difficulty",
        },
      ],
      quadrant_low_impact_high_difficulty: [
        {
          variable_id: "VAR_005",
          variable_name: "競合施策",
          impact_score: 6,
          implementation_difficulty_score: 8,
          priority_rank: 5,
          quadrant: "low_impact_high_difficulty",
        },
      ],
      priority_overall_ranking: [
        {
          variable_id: "VAR_001",
          variable_name: "季節",
          impact_score: 9,
          implementation_difficulty_score: 3,
          priority_rank: 1,
          quadrant: "high_impact_low_difficulty",
        },
        {
          variable_id: "VAR_003",
          variable_name: "イベント",
          impact_score: 8,
          implementation_difficulty_score: 7,
          priority_rank: 2,
          quadrant: "high_impact_high_difficulty",
        },
        {
          variable_id: "VAR_004",
          variable_name: "価格変動",
          impact_score: 4,
          implementation_difficulty_score: 2,
          priority_rank: 3,
          quadrant: "high_impact_low_difficulty",
        },
        {
          variable_id: "VAR_002",
          variable_name: "天候",
          impact_score: 7,
          implementation_difficulty_score: 5,
          priority_rank: 4,
          quadrant: "low_impact_low_difficulty",
        },
        {
          variable_id: "VAR_005",
          variable_name: "競合施策",
          impact_score: 6,
          implementation_difficulty_score: 8,
          priority_rank: 5,
          quadrant: "low_impact_high_difficulty",
        },
      ],
    });

    expect(result.quadrant_high_impact_low_difficulty.length).toBe(2);
    expect(result.quadrant_high_impact_high_difficulty.length).toBe(1);
    expect(result.quadrant_low_impact_low_difficulty.length).toBe(1);
    expect(result.quadrant_low_impact_high_difficulty.length).toBe(1);

    expect(result.priority_overall_ranking[0].variable_id).toBe("VAR_001");
    expect(result.priority_overall_ranking[0].priority_rank).toBe(1);
    expect(result.priority_overall_ranking[0].quadrant).toBe(
      "high_impact_low_difficulty"
    );

    const all_variables_in_result = [
      ...result.quadrant_high_impact_low_difficulty,
      ...result.quadrant_high_impact_high_difficulty,
      ...result.quadrant_low_impact_low_difficulty,
      ...result.quadrant_low_impact_high_difficulty,
    ];

    expect(all_variables_in_result.length).toBe(5);

    all_variables_in_result.forEach((variable) => {
      expect(variable.variable_id).toMatch(/^VAR_\d{3}$/);
      expect(variable.priority_rank).toBeGreaterThanOrEqual(1);
      expect(variable.priority_rank).toBeLessThanOrEqual(5);
      expect([
        "high_impact_low_difficulty",
        "high_impact_high_difficulty",
        "low_impact_low_difficulty",
        "low_impact_high_difficulty",
      ]).toContain(variable.quadrant);
    });

    const impact_difficulty_threshold = 5.5;
    result.quadrant_high_impact_low_difficulty.forEach((variable) => {
      expect(variable.impact_score).toBeGreaterThanOrEqual(
        impact_difficulty_threshold
      );
      expect(variable.implementation_difficulty_score).toBeLessThan(
        impact_difficulty_threshold
      );
    });

    result.quadrant_high_impact_high_difficulty.forEach((variable) => {
      expect(variable.impact_score).toBeGreaterThanOrEqual(
        impact_difficulty_threshold
      );
      expect(variable.implementation_difficulty_score).toBeGreaterThanOrEqual(
        impact_difficulty_threshold
      );
    });

    result.quadrant_low_impact_low_difficulty.forEach((variable) => {
      expect(variable.impact_score).toBeLessThan(impact_difficulty_threshold);
      expect(variable.implementation_difficulty_score).toBeLessThan(
        impact_difficulty_threshold
      );
    });

    result.quadrant_low_impact_high_difficulty.forEach((variable) => {
      expect(variable.impact_score).toBeLessThan(impact_difficulty_threshold);
      expect(variable.implementation_difficulty_score).toBeGreaterThanOrEqual(
        impact_difficulty_threshold
      );
    });

    const priority_scores = result.priority_overall_ranking.map((v) => {
      const normalized_impact =
        v.impact_score / 10;
      const normalized_difficulty =
        v.implementation_difficulty_score / 10;
      return normalized_impact - normalized_difficulty * 0.5;
    });

    for (let i = 0; i < priority_scores.length - 1; i++) {
      expect(priority_scores[i]).toBeGreaterThanOrEqual(priority_scores[i + 1]);
    }
  });
});