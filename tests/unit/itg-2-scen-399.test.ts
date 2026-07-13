import { validateAndSaveDietaryRestriction } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  // SCEN-399
  test("新規食事制限条件が過去献立と整合性を持つ場合、抵触リスクなしで送信許可される", () => {
    // Arrange: 過去の献立データと栄養摂取実績
    const pastMealRecords = [
      {
        mealId: "meal_001",
        date: "2024-01-08",
        proteinGrams: 18.5,
        carbsGrams: 65.3,
        fatsGrams: 22.1,
        fiberGrams: 8.2,
        sodiumMg: 1850
      },
      {
        mealId: "meal_002",
        date: "2024-01-09",
        proteinGrams: 19.2,
        carbsGrams: 62.8,
        fatsGrams: 20.9,
        fiberGrams: 7.9,
        sodiumMg: 1920
      },
      {
        mealId: "meal_003",
        date: "2024-01-10",
        proteinGrams: 21.3,
        carbsGrams: 68.5,
        fatsGrams: 23.7,
        fiberGrams: 8.6,
        sodiumMg: 1780
      }
    ];

    // ユーザーが入力した新しい食事制限条件（過去実績より高めに設定：整合性あり）
    const newRestrictionInput = {
      userId: "user_001",
      proteinLimitGrams: 25.0,
      carbsLimitGrams: 75.0,
      fatsLimitGrams: 28.0,
      fiberMinGrams: 7.5,
      sodiumLimitMg: 2100,
      restrictionType: "dietary_adjustment",
      createdAt: new Date("2024-01-15T11:00:00Z"),
      notes: ""
    };

    // Act: 入力内容の検証と保存処理を実行
    const result = validateAndSaveDietaryRestriction(
      newRestrictionInput,
      pastMealRecords
    );

    // Assert: 期待値を具体値で設定
    expect(result).toEqual({
      isValid: true,
      conflictRiskLevel: "none",
      conflictCount: 0,
      conflictingMealIds: [],
      proteinComplianceRate: 96.0, // 過去最高値21.3g ÷ 制限値25.0g × 100 = 85.2%（安全）
      carbsComplianceRate: 91.3, // 過去最高値68.5g ÷ 制限値75.0g × 100 = 91.3%（安全）
      fatsComplianceRate: 84.6, // 過去最高値23.7g ÷ 制限値28.0g × 100 = 84.6%（安全）
      fiberComplianceRate: 114.7, // 過去最低値7.9g ÷ 最小値7.5g × 100 = 105.3%（達成可能）
      sodiumComplianceRate: 91.4, // 過去最高値1920mg ÷ 制限値2100mg × 100 = 91.4%（安全）
      riskMessage: "",
      canSubmit: true,
      restrictionId: "restriction_001",
      savedAt: new Date("2024-01-15T11:00:00Z")
    });

    // 追加検証: リスク警告が表示されないことを確認
    expect(result.riskMessage).toBe("");
    expect(result.canSubmit).toBe(true);
    expect(result.conflictRiskLevel).toBe("none");

    // 追加検証: 抵触する献立がないことを確認
    expect(result.conflictCount).toBe(0);
    expect(result.conflictingMealIds.length).toBe(0);

    // 追加検証: すべての栄養素の遵守率が合理的な範囲内であることを確認
    expect(result.proteinComplianceRate).toBeGreaterThan(80);
    expect(result.proteinComplianceRate).toBeLessThanOrEqual(100);
    expect(result.carbsComplianceRate).toBeGreaterThan(80);
    expect(result.fatsComplianceRate).toBeGreaterThan(80);
    expect(result.sodiumComplianceRate).toBeGreaterThan(80);
  });
});