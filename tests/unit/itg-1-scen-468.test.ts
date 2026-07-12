import { detectAndPrioritizeFoodRestrictions } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-468: [error] 複数食事制限条件の優先度自動判定機能 - 過去献立データが存在しない場合でも優先度判定が実行される
  test("過去献立データなしで複数食事制限条件の優先度を自動判定", async () => {
    const restrictions = [
      {
        restrictionId: "rest_001",
        type: "アレルギー",
        description: "ピーナッツアレルギー",
        severity: "高",
      },
      {
        restrictionId: "rest_002",
        type: "カロリー制限",
        description: "1日1500kcal以下",
        severity: "中",
      },
      {
        restrictionId: "rest_003",
        type: "宗教的制限",
        description: "豚肉を食べない",
        severity: "高",
      },
    ];

    const userId = "user_123";
    const familyMemberId = "family_456";
    const pastMealPlans = [];

    const result = await detectAndPrioritizeFoodRestrictions({
      userId,
      familyMemberId,
      restrictions,
      pastMealPlans,
    });

    expect(result.statusCode).toBe(200);
    expect(result.prioritizedRestrictions).toHaveLength(3);

    const rest001Priority = result.prioritizedRestrictions.find(
      (r) => r.restrictionId === "rest_001"
    );
    expect(rest001Priority).toBeDefined();
    expect(rest001Priority?.priority).toBeGreaterThanOrEqual(1);
    expect(rest001Priority?.priority).toBeLessThanOrEqual(3);

    const rest002Priority = result.prioritizedRestrictions.find(
      (r) => r.restrictionId === "rest_002"
    );
    expect(rest002Priority).toBeDefined();
    expect(rest002Priority?.priority).toBeGreaterThanOrEqual(1);
    expect(rest002Priority?.priority).toBeLessThanOrEqual(3);

    const rest003Priority = result.prioritizedRestrictions.find(
      (r) => r.restrictionId === "rest_003"
    );
    expect(rest003Priority).toBeDefined();
    expect(rest003Priority?.priority).toBeGreaterThanOrEqual(1);
    expect(rest003Priority?.priority).toBeLessThanOrEqual(3);

    expect(result.conflictingMealPlans).toEqual([]);

    expect(result.prioritizedRestrictions.every((r) => r.priority !== null)).toBe(
      true
    );
  });
});