import { rankMenuCandidatesByConstraints } from "../../src/logic/it-1-br-2-1-1-1";

describe("複数制約条件下での献立候補ランキング", () => {
  // SCEN-335
  test("全ての制約条件を同時に満たす献立候補が存在しない場合、優先度付けルールに基づいて部分最適解が返却される", () => {
    const constraints = {
      calorieMax: 1500,
      proteinMin: 80,
      fatMax: 20,
      fiberMin: 15,
      allergenExclude: ["卵", "乳製品", "ナッツ類"],
    };

    const menuCandidates = [
      {
        menuId: "menu_001",
        name: "鶏肉と野菜の塩焼き",
        calories: 1200,
        protein: 85,
        fat: 22,
        fiber: 10,
        allergens: ["乳製品"],
        satisfiedConstraints: [
          "calorieMax",
          "proteinMin",
          "fiberMin_not_met",
        ],
        unsatisfiedConstraints: ["fatMax", "fiberMin"],
        priority: 1,
      },
      {
        menuId: "menu_002",
        name: "豚肉の脂身カット焼き",
        calories: 1450,
        protein: 78,
        fat: 18,
        fiber: 16,
        allergens: [],
        satisfiedConstraints: [
          "calorieMax",
          "fatMax",
          "fiberMin",
          "allergenExclude",
        ],
        unsatisfiedConstraints: ["proteinMin"],
        priority: 2,
      },
      {
        menuId: "menu_003",
        name: "白身魚と穀物サラダ",
        calories: 1100,
        protein: 65,
        fat: 12,
        fiber: 18,
        allergens: [],
        satisfiedConstraints: [
          "calorieMax",
          "fatMax",
          "fiberMin",
          "allergenExclude",
        ],
        unsatisfiedConstraints: ["proteinMin"],
        priority: 3,
      },
    ];

    const result = rankMenuCandidatesByConstraints({
      constraints,
      candidates: menuCandidates,
    });

    expect(result).toBeDefined();
    expect(result.candidates).toBeDefined();
    expect(Array.isArray(result.candidates)).toBe(true);
    expect(result.candidates.length).toBeGreaterThan(0);

    expect(result.hasFullySatisfiedCandidate).toBe(false);

    expect(result.candidates[0].menuId).toBe("menu_002");
    expect(result.candidates[0].priority).toBe(2);
    expect(result.candidates[0].constraintFulfillmentScore).toBe(80);

    expect(result.candidates[1].menuId).toBe("menu_001");
    expect(result.candidates[1].priority).toBe(1);
    expect(result.candidates[1].constraintFulfillmentScore).toBe(60);

    expect(result.candidates[2].menuId).toBe("menu_003");
    expect(result.candidates[2].priority).toBe(3);
    expect(result.candidates[2].constraintFulfillmentScore).toBe(80);

    result.candidates.forEach((candidate) => {
      expect(candidate.satisfiedConstraints).toBeDefined();
      expect(Array.isArray(candidate.satisfiedConstraints)).toBe(true);
      expect(candidate.unsatisfiedConstraints).toBeDefined();
      expect(Array.isArray(candidate.unsatisfiedConstraints)).toBe(true);
      expect(
        candidate.satisfiedConstraints.length +
          candidate.unsatisfiedConstraints.length
      ).toBeGreaterThan(0);
    });

    const prioritySequence = result.candidates.map((c) => c.priority);
    expect(prioritySequence[0]).toBeLessThanOrEqual(prioritySequence[1]);
    expect(prioritySequence[1]).toBeLessThanOrEqual(prioritySequence[2]);

    result.candidates.forEach((candidate) => {
      expect(candidate.constraintFulfillmentScore).toBeGreaterThanOrEqual(0);
      expect(candidate.constraintFulfillmentScore).toBeLessThanOrEqual(100);
    });

    result.candidates.forEach((candidate) => {
      candidate.allergens.forEach((allergen) => {
        expect(constraints.allergenExclude).not.toContain(allergen);
      });
    });

    expect(result.partialOptimalCount).toBe(3);
    expect(result.constraintsPriority).toEqual([
      "allergenExclude",
      "calorieMax",
      "fatMax",
      "fiberMin",
      "proteinMin",
    ]);
  });
});