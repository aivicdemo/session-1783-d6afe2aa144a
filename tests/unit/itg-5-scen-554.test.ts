import { rankMenuCandidatesByConstraints } from "../../src/logic/it-7-2-1";

describe("献立候補複数制約条件ランキング機能", () => {
  // SCEN-554: 同一満足度スコアの複数候補が優先度付けルール（栄養スコア→調理時間→予算）で正しくソートされる
  test("同一満足度スコア候補をソート優先度ルール順に並べ替える", () => {
    const candidates = [
      {
        candidateId: "menu_001",
        satisfactionScore: 85,
        nutritionScore: 85,
        cookingTimeMinutes: 25,
        budgetYen: 1200,
      },
      {
        candidateId: "menu_002",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
      },
      {
        candidateId: "menu_003",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 35,
        budgetYen: 900,
      },
      {
        candidateId: "menu_004",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1100,
      },
    ];

    const constraints = {
      nutritionScoreMin: 80,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 期待される順序：
    // 第1優先度（栄養スコア降順）: nutritionScore 90が先
    // 第2優先度（調理時間昇順）: 同一栄養90の場合、30分 < 35分
    // 第3優先度（予算昇順）: 同一栄養90・30分の場合、1000円 < 1100円
    expect(result).toEqual([
      {
        candidateId: "menu_002",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
        rank: 1,
      },
      {
        candidateId: "menu_004",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1100,
        rank: 2,
      },
      {
        candidateId: "menu_003",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 35,
        budgetYen: 900,
        rank: 3,
      },
      {
        candidateId: "menu_001",
        satisfactionScore: 85,
        nutritionScore: 85,
        cookingTimeMinutes: 25,
        budgetYen: 1200,
        rank: 4,
      },
    ]);
  });

  test("全項目が同一値の候補についても一貫性のあるソートを実行する", () => {
    const candidates = [
      {
        candidateId: "menu_a",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
      },
      {
        candidateId: "menu_b",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
      },
      {
        candidateId: "menu_c",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
      },
    ];

    const constraints = {
      nutritionScoreMin: 80,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 全項目同一の場合、candidateId の辞書順でソート
    expect(result).toEqual([
      {
        candidateId: "menu_a",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
        rank: 1,
      },
      {
        candidateId: "menu_b",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
        rank: 2,
      },
      {
        candidateId: "menu_c",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
        rank: 3,
      },
    ]);
  });

  test("制約条件を満たさない候補は除外してソートを実行する", () => {
    const candidates = [
      {
        candidateId: "menu_ng_budget",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1600,
      },
      {
        candidateId: "menu_ok_1",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
      },
      {
        candidateId: "menu_ng_time",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 70,
        budgetYen: 1000,
      },
      {
        candidateId: "menu_ok_2",
        satisfactionScore: 85,
        nutritionScore: 85,
        cookingTimeMinutes: 25,
        budgetYen: 900,
      },
    ];

    const constraints = {
      nutritionScoreMin: 80,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 制約条件外の候補は除外される
    expect(result.length).toBe(2);
    expect(result[0].candidateId).toBe("menu_ok_1");
    expect(result[1].candidateId).toBe("menu_ok_2");
  });

  test("ソート結果が正しいJSON形式で返却される", () => {
    const candidates = [
      {
        candidateId: "menu_x",
        satisfactionScore: 85,
        nutritionScore: 88,
        cookingTimeMinutes: 32,
        budgetYen: 1050,
      },
    ];

    const constraints = {
      nutritionScoreMin: 80,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 返却データ型の検証
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("candidateId");
    expect(result[0]).toHaveProperty("satisfactionScore");
    expect(result[0]).toHaveProperty("nutritionScore");
    expect(result[0]).toHaveProperty("cookingTimeMinutes");
    expect(result[0]).toHaveProperty("budgetYen");
    expect(result[0]).toHaveProperty("rank");
    expect(typeof result[0].rank).toBe("number");
  });

  test("栄養スコアが異なる候補は栄養スコア降順が最優先される", () => {
    const candidates = [
      {
        candidateId: "menu_low_nutrition",
        satisfactionScore: 85,
        nutritionScore: 70,
        cookingTimeMinutes: 20,
        budgetYen: 800,
      },
      {
        candidateId: "menu_high_nutrition",
        satisfactionScore: 85,
        nutritionScore: 95,
        cookingTimeMinutes: 50,
        budgetYen: 1300,
      },
      {
        candidateId: "menu_mid_nutrition",
        satisfactionScore: 85,
        nutritionScore: 85,
        cookingTimeMinutes: 30,
        budgetYen: 1000,
      },
    ];

    const constraints = {
      nutritionScoreMin: 60,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 栄養スコアの降順: 95 > 85 > 70
    expect(result[0].nutritionScore).toBe(95);
    expect(result[1].nutritionScore).toBe(85);
    expect(result[2].nutritionScore).toBe(70);
  });

  test("栄養スコア同一の場合は調理時間昇順が第2優先度になる", () => {
    const candidates = [
      {
        candidateId: "menu_long_time",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 45,
        budgetYen: 950,
      },
      {
        candidateId: "menu_short_time",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 20,
        budgetYen: 1200,
      },
      {
        candidateId: "menu_mid_time",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1100,
      },
    ];

    const constraints = {
      nutritionScoreMin: 80,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 栄養スコア同一(90)の場合、調理時間昇順: 20 < 30 < 45
    expect(result[0].cookingTimeMinutes).toBe(20);
    expect(result[1].cookingTimeMinutes).toBe(30);
    expect(result[2].cookingTimeMinutes).toBe(45);
  });

  test("栄養スコアと調理時間が同一の場合は予算昇順が第3優先度になる", () => {
    const candidates = [
      {
        candidateId: "menu_expensive",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1300,
      },
      {
        candidateId: "menu_cheap",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 900,
      },
      {
        candidateId: "menu_mid_price",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1100,
      },
    ];

    const constraints = {
      nutritionScoreMin: 80,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // 栄養スコア(90)と調理時間(30)が同一の場合、予算昇順: 900 < 1100 < 1300
    expect(result[0].budgetYen).toBe(900);
    expect(result[1].budgetYen).toBe(1100);
    expect(result[2].budgetYen).toBe(1300);
  });

  test("ランク番号が1から順番に付与される", () => {
    const candidates = [
      {
        candidateId: "menu_rank3",
        satisfactionScore: 85,
        nutritionScore: 80,
        cookingTimeMinutes: 40,
        budgetYen: 1200,
      },
      {
        candidateId: "menu_rank1",
        satisfactionScore: 85,
        nutritionScore: 95,
        cookingTimeMinutes: 25,
        budgetYen: 1000,
      },
      {
        candidateId: "menu_rank2",
        satisfactionScore: 85,
        nutritionScore: 90,
        cookingTimeMinutes: 30,
        budgetYen: 1100,
      },
    ];

    const constraints = {
      nutritionScoreMin: 75,
      cookingTimeMinutesMax: 60,
      budgetYenMax: 1500,
    };

    const result = rankMenuCandidatesByConstraints(candidates, constraints);

    // ランク番号が1から連番で付与される
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
    expect(result[2].rank).toBe(3);
  });
});