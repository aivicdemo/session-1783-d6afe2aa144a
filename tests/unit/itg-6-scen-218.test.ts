import { generateImprovementProposal } from "../../src/logic/it-8-1-1-1";

describe("改善提案書生成機能 - エラーハンドリング検証", () => {
  // SCEN-218
  test("不完全な優先度スコアリング結果に対して適切なエラーハンドリングが実行される", () => {
    // テストケース1: スコア値が欠落した場合
    const incompleteScoring_missingScore = {
      painItemId: "PI-001",
      painItemName: "調理時間制限",
      importanceRank: "High",
      businessValue: undefined,
      technicalDifficulty: 5,
      userImpact: 8,
      totalPriorityScore: undefined,
    };

    expect(() => generateImprovementProposal(incompleteScoring_missingScore))
      .toThrow(/スコア値/);

    // テストケース2: ペイン項目IDが欠落した場合
    const incompleteScoring_missingPainItemId = {
      painItemId: undefined,
      painItemName: "食材制限",
      importanceRank: "Medium",
      businessValue: 7,
      technicalDifficulty: 3,
      userImpact: 6,
      totalPriorityScore: 5.3,
    };

    expect(() => generateImprovementProposal(incompleteScoring_missingPainItemId))
      .toThrow(/ペイン項目ID/);

    // テストケース3: 重要度ランクが欠落した場合
    const incompleteScoring_missingImportanceRank = {
      painItemId: "PI-003",
      painItemName: "予算制約",
      importanceRank: undefined,
      businessValue: 6,
      technicalDifficulty: 4,
      userImpact: 7,
      totalPriorityScore: 5.7,
    };

    expect(() => generateImprovementProposal(incompleteScoring_missingImportanceRank))
      .toThrow(/重要度ランク/);

    // テストケース4: 正常な優先度スコアリング結果で改善提案書が生成される
    const completeScoring = {
      painItemId: "PI-001",
      painItemName: "調理時間制限",
      importanceRank: "High",
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
      totalPriorityScore: 7.3,
      estimatedImplementationHours: 40,
      expectedEffectDescription: "調理時間を平均20分削減",
      kpiContribution: "献立生成成功率 +5%、ユーザー満足度 +3点",
      affectedSegments: ["専業主夫_30代_子2人", "専業主夫_40代_食物アレルギー"],
      implementationRiskLevel: "Medium",
    };

    const proposal = generateImprovementProposal(completeScoring);

    expect(proposal).toBeDefined();
    expect(proposal.proposalId).toBeDefined();
    expect(proposal.proposalId).toMatch(/^IMP-/);
    expect(proposal.painItemId).toBe("PI-001");
    expect(proposal.painItemName).toBe("調理時間制限");
    expect(proposal.priorityRank).toBe("High");
    expect(proposal.businessValue).toBe(8);
    expect(proposal.technicalDifficulty).toBe(5);
    expect(proposal.userImpact).toBe(9);
    expect(proposal.totalPriorityScore).toBe(7.3);
    expect(proposal.estimatedImplementationHours).toBe(40);
    expect(proposal.expectedEffectDescription).toBe("調理時間を平均20分削減");
    expect(proposal.kpiContribution).toBe("献立生成成功率 +5%、ユーザー満足度 +3点");
    expect(proposal.affectedSegments.length).toBe(2);
    expect(proposal.implementationRiskLevel).toBe("Medium");
    expect(proposal.generatedAt).toBeDefined();
    expect(typeof proposal.generatedAt).toBe("string");

    // テストケース5: ビジネス価値が欠落した場合
    const incompleteScoring_missingBusinessValue = {
      painItemId: "PI-002",
      painItemName: "食材制限",
      importanceRank: "High",
      businessValue: undefined,
      technicalDifficulty: 3,
      userImpact: 8,
      totalPriorityScore: 5.3,
    };

    expect(() => generateImprovementProposal(incompleteScoring_missingBusinessValue))
      .toThrow(/ビジネス価値/);

    // テストケース6: ユーザーインパクトが欠落した場合
    const incompleteScoring_missingUserImpact = {
      painItemId: "PI-003",
      painItemName: "予算制約",
      importanceRank: "Medium",
      businessValue: 6,
      technicalDifficulty: 4,
      userImpact: undefined,
      totalPriorityScore: 5.0,
    };

    expect(() => generateImprovementProposal(incompleteScoring_missingUserImpact))
      .toThrow(/ユーザーインパクト/);

    // テストケース7: 複数フィールドが欠落した場合（最初の欠落フィールドでエラー）
    const incompleteScoring_multipleFieldsMissing = {
      painItemId: undefined,
      painItemName: "調理時間制限",
      importanceRank: undefined,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: undefined,
      totalPriorityScore: undefined,
    };

    expect(() => generateImprovementProposal(incompleteScoring_multipleFieldsMissing))
      .toThrow(/ペイン項目ID/);

    // テストケース8: 技術難度が0未満の場合（無効な値）
    const invalidScoring_negativeTechnicalDifficulty = {
      painItemId: "PI-001",
      painItemName: "調理時間制限",
      importanceRank: "High",
      businessValue: 8,
      technicalDifficulty: -1,
      userImpact: 9,
      totalPriorityScore: 7.3,
    };

    expect(() => generateImprovementProposal(invalidScoring_negativeTechnicalDifficulty))
      .toThrow(/技術難度/);

    // テストケース9: ビジネス価値が10を超える場合（無効な値）
    const invalidScoring_oversizeBusinessValue = {
      painItemId: "PI-002",
      painItemName: "食材制限",
      importanceRank: "Medium",
      businessValue: 11,
      technicalDifficulty: 3,
      userImpact: 8,
      totalPriorityScore: 7.3,
    };

    expect(() => generateImprovementProposal(invalidScoring_oversizeBusinessValue))
      .toThrow(/ビジネス価値/);

    // テストケース10: 重要度ランクが有効な値でない場合
    const invalidScoring_invalidImportanceRank = {
      painItemId: "PI-003",
      painItemName: "予算制約",
      importanceRank: "Critical",
      businessValue: 6,
      technicalDifficulty: 4,
      userImpact: 7,
      totalPriorityScore: 5.7,
    };

    expect(() => generateImprovementProposal(invalidScoring_invalidImportanceRank))
      .toThrow(/重要度ランク/);
  });
});