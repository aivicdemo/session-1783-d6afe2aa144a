import { detectAndResolveConstraintConflicts } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-510
  test("優先条件競合検証・調整機能 - 食材制限と予算制約の競合を検出し代替案を提示", () => {
    // 準備: 食材制限と予算制約が矛盾するシナリオ
    const input = {
      foodRestrictions: [
        {
          ingredientId: "allergy_001",
          name: "ピーナッツ",
          severity: "high",
          alternativeIngredients: [
            {
              ingredientId: "alt_001",
              name: "アーモンドバター",
              unitPrice: 800,
            },
            {
              ingredientId: "alt_002",
              name: "ひまわりの種バター",
              unitPrice: 600,
            },
          ],
        },
        {
          ingredientId: "allergy_002",
          name: "小麦",
          severity: "high",
          alternativeIngredients: [
            {
              ingredientId: "alt_003",
              name: "米粉",
              unitPrice: 450,
            },
          ],
        },
      ],
      budgetConstraint: {
        mealsPerDay: 3,
        maxBudgetPerMeal: 500,
        currency: "JPY",
      },
      familySize: 4,
      analysisDate: "2024-01-15T09:00:00Z",
    };

    const result = detectAndResolveConstraintConflicts(input);

    // アサーション1: 競合が検出されたことを確認
    expect(result.conflictDetected).toBe(true);

    // アサーション2: 競合の原因が正確に特定されていることを確認
    expect(result.conflictDetails).toEqual(
      expect.objectContaining({
        conflictType: "budget_vs_restriction",
        description: expect.stringContaining("食材制限対応に必要な代替食材"),
      })
    );

    // アサーション3: 競合が家族全体の予算に影響することを確認
    const estimatedAlternativeCost = (800 + 600 + 450) / 3;
    expect(result.conflictDetails.estimatedCostPerMeal).toBeGreaterThan(
      input.budgetConstraint.maxBudgetPerMeal
    );
    expect(result.conflictDetails.estimatedCostPerMeal).toBe(
      Math.round(estimatedAlternativeCost * 100) / 100
    );

    // アサーション4: 複数の代替案が提示されることを確認
    expect(result.alternativeProposals).toHaveLength(3);

    // アサーション5: 代替案1 - 予算を増額する案
    const budgetIncreasOption = result.alternativeProposals.find(
      (p) => p.proposalType === "increase_budget"
    );
    expect(budgetIncreasOption).toBeDefined();
    expect(budgetIncreasOption?.recommendedBudgetPerMeal).toBeGreaterThan(500);
    expect(budgetIncreasOption?.feasibilityScore).toBe(95);
    expect(budgetIncreasOption?.explanation).toContain("予算を引き上げ");

    // アサーション6: 代替案2 - 制限を緩和する案
    const relaxRestrictionOption = result.alternativeProposals.find(
      (p) => p.proposalType === "relax_restriction"
    );
    expect(relaxRestrictionOption).toBeDefined();
    expect(relaxRestrictionOption?.relaxableRestrictions).toEqual(
      expect.arrayContaining(["ピーナッツ", "小麦"])
    );
    expect(relaxRestrictionOption?.feasibilityScore).toBe(45);
    expect(relaxRestrictionOption?.explanation).toContain("食材制限を部分的に緩和");

    // アサーション7: 代替案3 - 安価な代替食材を使用する案
    const cheaperAlternativeOption = result.alternativeProposals.find(
      (p) => p.proposalType === "cheaper_alternative"
    );
    expect(cheaperAlternativeOption).toBeDefined();
    expect(cheaperAlternativeOption?.suggestedAlternatives).toEqual(
      expect.arrayContaining([
        {
          restrictedIngredient: "ピーナッツ",
          alternative: "ひまわりの種バター",
          unitPrice: 600,
        },
        {
          restrictedIngredient: "小麦",
          alternative: "米粉",
          unitPrice: 450,
        },
      ])
    );
    expect(cheaperAlternativeOption?.estimatedBudgetPerMeal).toBeLessThanOrEqual(
      550
    );
    expect(cheaperAlternativeOption?.feasibilityScore).toBe(78);

    // アサーション8: 各代替案に対応する実行可能性スコアが妥当かを確認
    expect(result.alternativeProposals.every((p) => p.feasibilityScore >= 0 && p.feasibilityScore <= 100)).toBe(
      true
    );

    // アサーション9: 優先度順にソートされていることを確認
    const scores = result.alternativeProposals.map((p) => p.feasibilityScore);
    const sortedScores = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedScores);

    // アサーション10: ユーザーが代替案を選択した後、献立が再生成されるシミュレーション
    const selectedProposal = result.alternativeProposals[0];
    const regenerationInput = {
      selectedProposalType: selectedProposal.proposalType,
      adjustedBudget:
        selectedProposal.proposalType === "increase_budget"
          ? selectedProposal.recommendedBudgetPerMeal
          : input.budgetConstraint.maxBudgetPerMeal,
      adjustedRestrictions: input.foodRestrictions,
    };

    expect(regenerationInput.adjustedBudget).toBeGreaterThanOrEqual(
      input.budgetConstraint.maxBudgetPerMeal
    );
    expect(regenerationInput.adjustedRestrictions).toHaveLength(2);

    // アサーション11: 結果全体の構造が完全であることを確認
    expect(result).toEqual(
      expect.objectContaining({
        conflictDetected: true,
        conflictDetails: expect.objectContaining({
          conflictType: expect.any(String),
          description: expect.any(String),
          estimatedCostPerMeal: expect.any(Number),
        }),
        alternativeProposals: expect.arrayContaining([
          expect.objectContaining({
            proposalType: expect.any(String),
            explanation: expect.any(String),
            feasibilityScore: expect.any(Number),
          }),
        ]),
        resolvedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
        ),
      })
    );

    // アサーション12: 競合解決メッセージが業務的に適切であることを確認
    expect(result.conflictDetails.description).toMatch(/食材制限|予算/);
  });
});