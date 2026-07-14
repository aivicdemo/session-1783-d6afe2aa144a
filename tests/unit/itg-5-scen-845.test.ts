import { validateRuleChangeIntegrity } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの成功・失敗パターン分析と改善提案", () => {
  // SCEN-845: [edge] ルール変更時の整合性自動検証 - 家族の食事評価データが空の状態で新ルールの検証を実行した場合、整合性チェックがスキップされて検証が完了する
  test("should skip integrity check and complete validation when family evaluation data is empty", () => {
    // Arrange: 家族の食事評価データが空の状態
    const emptyFamilyEvaluationData: Array<{
      familyMemberId: string;
      mealId: string;
      satisfactionScore: number;
      completionRate: number;
      timestamp: string;
    }> = [];

    // 新しいルール定義
    const newRuleDefinition = {
      ruleId: "rule_seasonal_001",
      ruleName: "旬の食材優先度ルール",
      seasonalPattern: "spring",
      discountThreshold: 0.15,
      salesPeriod: "2024-03-01T00:00:00Z",
      priority: 85,
    };

    // 過去の献立履歴（ルール変更による矛盾がないか確認用）
    const pastMealHistory: Array<{
      mealId: string;
      ingredients: Array<{ ingredientId: string; name: string }>;
      createdAt: string;
    }> = [];

    // 家族の食事制限データ（空の評価データとの整合性確認用）
    const familyRestrictions = [
      {
        familyMemberId: "member_001",
        restrictions: ["gluten_free"],
      },
    ];

    // Act: 検証を実行
    const validationResult = validateRuleChangeIntegrity({
      newRuleDefinition,
      familyEvaluationData: emptyFamilyEvaluationData,
      pastMealHistory,
      familyRestrictions,
    });

    // Assert: 検証結果の確認
    // 1. ステータスが「完了」であることを確認
    expect(validationResult.validationStatus).toBe("completed");

    // 2. 整合性チェックがスキップされたことを確認
    expect(validationResult.integrityCheckSkipped).toBe(true);

    // 3. エラーが発生していないことを確認
    expect(validationResult.errors).toEqual([]);

    // 4. 警告が発生していないことを確認
    expect(validationResult.warnings).toEqual([]);

    // 5. 検証ログに整合性チェックスキップが記録されていることを確認
    expect(validationResult.validationLog).toContain("整合性チェックスキップ");

    // 6. 検証結果のタイムスタンプが有効であることを確認
    expect(validationResult.completedAt).toBeDefined();
    expect(validationResult.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // 7. 新しいルール定義が検証結果に紐付けられていることを確認
    expect(validationResult.appliedRuleId).toBe("rule_seasonal_001");

    // 8. 検証結果全体の整合性を確認
    expect(validationResult).toEqual({
      validationStatus: "completed",
      integrityCheckSkipped: true,
      errors: [],
      warnings: [],
      validationLog: expect.stringContaining("整合性チェックスキップ"),
      completedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
      appliedRuleId: "rule_seasonal_001",
      dataQualityScore: 0,
      skippedCheckReasons: ["empty_family_evaluation_data"],
    });
  });
});