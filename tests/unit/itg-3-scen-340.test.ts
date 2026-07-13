import { rankMenuCandidatesByConstraints } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase record tracking and monthly food cost reduction effect auto-aggregation & analysis", () => {
  // SCEN-340: [edge] 複数制約条件下での献立候補ランキング機能 - 満足度スコアが同一の献立候補が複数存在する場合、安定したソート順序が保持される
  test("should maintain stable sort order for menu candidates with identical satisfaction scores across multiple searches and sessions", () => {
    const constraints = {
      maxBudget: 3000,
      minProtein: 30,
      maxCookingTime: 30,
    };

    const menu_candidates = [
      {
        menu_id: "M005",
        satisfaction_score: 85,
        budget: 2800,
        protein: 35,
        cooking_time: 25,
        registration_order: 5,
      },
      {
        menu_id: "M002",
        satisfaction_score: 85,
        budget: 2900,
        protein: 32,
        cooking_time: 28,
        registration_order: 2,
      },
      {
        menu_id: "M001",
        satisfaction_score: 85,
        budget: 2500,
        protein: 30,
        cooking_time: 20,
        registration_order: 1,
      },
      {
        menu_id: "M003",
        satisfaction_score: 90,
        budget: 2700,
        protein: 38,
        cooking_time: 22,
        registration_order: 3,
      },
      {
        menu_id: "M004",
        satisfaction_score: 80,
        budget: 2600,
        protein: 31,
        cooking_time: 26,
        registration_order: 4,
      },
    ];

    // First search
    const result_1 = rankMenuCandidatesByConstraints(
      menu_candidates,
      constraints
    );
    expect(result_1).toHaveLength(5);
    expect(result_1[0].menu_id).toBe("M003");
    expect(result_1[0].satisfaction_score).toBe(90);
    expect(result_1[1].menu_id).toBe("M001");
    expect(result_1[1].satisfaction_score).toBe(85);
    expect(result_1[2].menu_id).toBe("M002");
    expect(result_1[2].satisfaction_score).toBe(85);
    expect(result_1[3].menu_id).toBe("M005");
    expect(result_1[3].satisfaction_score).toBe(85);
    expect(result_1[4].menu_id).toBe("M004");
    expect(result_1[4].satisfaction_score).toBe(80);

    // Verify secondary sort key (registration_order) is applied for score 85
    const score_85_candidates_1 = result_1.filter(
      (m) => m.satisfaction_score === 85
    );
    expect(score_85_candidates_1.map((m) => m.menu_id)).toEqual([
      "M001",
      "M002",
      "M005",
    ]);

    // Second search - same constraints, verify identical order
    const result_2 = rankMenuCandidatesByConstraints(
      menu_candidates,
      constraints
    );
    expect(result_2.map((m) => m.menu_id)).toEqual(
      result_1.map((m) => m.menu_id)
    );

    // Third search - same constraints, verify identical order maintained
    const result_3 = rankMenuCandidatesByConstraints(
      menu_candidates,
      constraints
    );
    expect(result_3.map((m) => m.menu_id)).toEqual(
      result_1.map((m) => m.menu_id)
    );

    // Simulate different session - same constraints, verify identical order
    const result_session_2 = rankMenuCandidatesByConstraints(
      menu_candidates,
      constraints
    );
    expect(result_session_2.map((m) => m.menu_id)).toEqual(
      result_1.map((m) => m.menu_id)
    );

    // Verify all candidates satisfy constraints
    result_1.forEach((menu) => {
      expect(menu.budget).toBeLessThanOrEqual(constraints.maxBudget);
      expect(menu.protein).toBeGreaterThanOrEqual(constraints.minProtein);
      expect(menu.cooking_time).toBeLessThanOrEqual(
        constraints.maxCookingTime
      );
    });

    // Verify stability: candidates with identical scores maintain order across all searches
    const score_85_1 = result_1
      .filter((m) => m.satisfaction_score === 85)
      .map((m) => m.menu_id);
    const score_85_2 = result_2
      .filter((m) => m.satisfaction_score === 85)
      .map((m) => m.menu_id);
    const score_85_3 = result_3
      .filter((m) => m.satisfaction_score === 85)
      .map((m) => m.menu_id);
    const score_85_session2 = result_session_2
      .filter((m) => m.satisfaction_score === 85)
      .map((m) => m.menu_id);

    expect(score_85_2).toEqual(score_85_1);
    expect(score_85_3).toEqual(score_85_1);
    expect(score_85_session2).toEqual(score_85_1);
  });
});