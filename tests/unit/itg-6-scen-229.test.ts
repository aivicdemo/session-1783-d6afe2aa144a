import {
  validateImprovementProposalReview,
  recordTechnicalFeasibilityReview,
  generateImplementationRoadmap,
} from "../../src/logic/it-1-br-8-2-1-1";

describe("改善提案のレビューと技術実現性検証", () => {
  // SCEN-229
  test("優先度付けされた改善提案がアプリ開発チームに受領され技術実現性が検証されロードマップに組み込まれる", () => {
    // Arrange: 優先度付けされた改善提案データを準備
    const proposalId = "PROP-2024-001";
    const proposalTitle = "献立生成成功率の向上";
    const priorityScore = 85;
    const businessValue = 90;
    const technicalDifficulty = 40;
    const userImpact = 80;
    const painFactorCategory = "栄養バランス";
    const affectedSegments = ["専業主夫", "共働き子育て"];

    const reviewInput = {
      proposalId,
      proposalTitle,
      priorityScore,
      businessValue,
      technicalDifficulty,
      userImpact,
      painFactorCategory,
      affectedSegments,
      reviewComment: "栄養バランスアルゴリズムの改善により成功率向上が期待できる",
      reviewerTeam: "appDevelopment",
      feasibilityStatus: "実現可能" as const,
      technicalEvaluationItems: {
        implementationDifficulty: 3,
        requiredResources: 2,
        estimatedWorkHours: 80,
        estimatedDays: 10,
        requiredSkills: ["アルゴリズム", "栄養基準知識"],
      },
      reviewedAt: new Date("2024-02-15T14:30:00Z"),
    };

    // Act: 改善提案レビューの入力妥当性を検証
    const validationResult = validateImprovementProposalReview(reviewInput);
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);

    // Act: 技術実現性レビュー内容を記録
    const reviewRecord = recordTechnicalFeasibilityReview(reviewInput);
    expect(reviewRecord.reviewId).toBeDefined();
    expect(reviewRecord.proposalId).toBe(proposalId);
    expect(reviewRecord.feasibilityStatus).toBe("実現可能");
    expect(reviewRecord.technicalEvaluationItems.estimatedWorkHours).toBe(80);
    expect(reviewRecord.technicalEvaluationItems.implementationDifficulty).toBe(3);
    expect(reviewRecord.isRecorded).toBe(true);

    // Act: ロードマップに改善提案を生成・組み込み
    const roadmapInput = {
      approvedProposalIds: [proposalId],
      proposalDetails: [
        {
          proposalId,
          proposalTitle,
          feasibilityStatus: "実現可能" as const,
          priorityScore: 85,
          estimatedWorkHours: 80,
          estimatedDays: 10,
          targetSprint: "Sprint-24-Q1-02",
          targetPhase: "implementation",
        },
      ],
      currentQuarter: "Q1-2024",
      generatedAt: new Date("2024-02-15T15:00:00Z"),
    };

    const roadmap = generateImplementationRoadmap(roadmapInput);

    // Assert: ロードマップが生成され、改善提案が配置されていることを検証
    expect(roadmap.roadmapId).toBeDefined();
    expect(roadmap.totalProposalsIncluded).toBe(1);
    expect(roadmap.sprint02IncludedProposals).toContain(proposalId);
    expect(roadmap.proposalPhaseMapping[proposalId]).toBe("implementation");

    // Assert: 改善提案がロードマップ内で適切に配置されていることを確認
    const proposalInRoadmap = roadmap.sprintDetails.find(
      (sprint: any) => sprint.sprintId === "Sprint-24-Q1-02"
    );
    expect(proposalInRoadmap).toBeDefined();
    expect(proposalInRoadmap.proposals).toContainEqual(
      expect.objectContaining({
        proposalId,
        proposalTitle,
        priorityScore: 85,
        estimatedWorkHours: 80,
      })
    );

    // Assert: 検証ステータスが更新されていることを確認
    expect(reviewRecord.feasibilityStatus).toBe("実現可能");
    expect(reviewRecord.technicalEvaluationItems.requiredSkills).toContain(
      "アルゴリズム"
    );
    expect(reviewRecord.technicalEvaluationItems.requiredSkills).toContain(
      "栄養基準知識"
    );

    // Assert: ロードマップとレビュー情報の連携が確立されていることを確認
    expect(roadmap.linkedReviewIds).toContain(reviewRecord.reviewId);
    expect(roadmap.isLinkedToReview).toBe(true);

    // Assert: 技術評価情報が記録されていることを確認
    expect(reviewRecord.technicalEvaluationItems).toEqual({
      implementationDifficulty: 3,
      requiredResources: 2,
      estimatedWorkHours: 80,
      estimatedDays: 10,
      requiredSkills: ["アルゴリズム", "栄養基準知識"],
    });

    // Assert: 承認済み提案がロードマップに反映されていることを確認
    expect(roadmap.approvalStatus).toBe("approved");
    expect(roadmap.readyForImplementation).toBe(true);
  });
});