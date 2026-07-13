import {
  generateImprovementProposalDocument,
} from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養基準ロジック改善提案の優先度付けと開発チーム提出 - 改善提案書生成", () => {
  // SCEN-523: [normal] 改善提案書生成機能 - 優先度スコアリング完了時に実装見積・期待効果・KPI寄与度を含む提案書が生成される
  test("should generate improvement proposal document with implementation estimate, expected effect, and KPI contribution after priority scoring completion", () => {
    const improvements = [
      {
        id: "IMP-001",
        title: "タンパク質摂取基準の引き上げ",
        category: "nutrition_balance",
        description: "高齢者向けタンパク質摂取目標を現在の1.0g/kg体重から1.2g/kg体重に引き上げ",
        businessValue: 8,
        technicalDifficulty: 3,
        userImpact: 7,
        estimatedWorkDays: 5,
        estimatedPersonDays: 10,
        estimatedCost: 150000,
        developmentPeriod: "2024-02-01T00:00:00Z/2024-02-15T00:00:00Z",
        expectedQuantitativeEffect: "ユーザーセグメント内のタンパク質目標達成率を現在の62%から80%に向上",
        expectedQualitativeEffect: "栄養状態の改善による体調向上の主観的満足度向上",
        affectedKpis: [
          {
            kpiName: "nutrition_achievement_rate",
            currentValue: 62,
            targetValue: 80,
            expectedImprovement: 18,
            estimatedImpactPercentage: 2.8,
          },
          {
            kpiName: "user_satisfaction_score",
            currentValue: 72,
            targetValue: 78,
            expectedImprovement: 6,
            estimatedImpactPercentage: 1.5,
          },
        ],
        priorityScore: 7.33,
        priorityRank: "high",
      },
      {
        id: "IMP-002",
        title: "調理時間予測アルゴリズムの精度向上",
        category: "algorithm_accuracy",
        description: "機械学習モデルの更新により、調理時間予測の誤差を±15分から±8分に短縮",
        businessValue: 6,
        technicalDifficulty: 7,
        userImpact: 5,
        estimatedWorkDays: 12,
        estimatedPersonDays: 36,
        estimatedCost: 540000,
        developmentPeriod: "2024-02-01T00:00:00Z/2024-03-15T00:00:00Z",
        expectedQuantitativeEffect: "献立却下率を現在の18%から12%に低下",
        expectedQualitativeEffect: "ユーザーの献立への信頼度向上、リピート利用率の増加",
        affectedKpis: [
          {
            kpiName: "menu_rejection_rate",
            currentValue: 18,
            targetValue: 12,
            expectedImprovement: -6,
            estimatedImpactPercentage: 3.2,
          },
          {
            kpiName: "user_trust_score",
            currentValue: 68,
            targetValue: 75,
            expectedImprovement: 7,
            estimatedImpactPercentage: 1.8,
          },
        ],
        priorityScore: 5.33,
        priorityRank: "medium",
      },
    ];

    const proposalDocument = generateImprovementProposalDocument(improvements);

    expect(proposalDocument).toBeDefined();
    expect(proposalDocument.documentId).toBeDefined();
    expect(proposalDocument.generatedAt).toBeDefined();
    expect(proposalDocument.totalProposals).toBe(2);

    expect(proposalDocument.proposals).toHaveLength(2);

    const firstProposal = proposalDocument.proposals[0];
    expect(firstProposal.id).toBe("IMP-001");
    expect(firstProposal.title).toBe("タンパク質摂取基準の引き上げ");

    expect(firstProposal.implementationEstimate).toBeDefined();
    expect(firstProposal.implementationEstimate.workDays).toBe(5);
    expect(firstProposal.implementationEstimate.personDays).toBe(10);
    expect(firstProposal.implementationEstimate.estimatedCostYen).toBe(150000);
    expect(firstProposal.implementationEstimate.developmentPeriodStart).toBe(
      "2024-02-01T00:00:00Z"
    );
    expect(firstProposal.implementationEstimate.developmentPeriodEnd).toBe(
      "2024-02-15T00:00:00Z"
    );

    expect(firstProposal.expectedEffect).toBeDefined();
    expect(firstProposal.expectedEffect.quantitativeEffect).toBe(
      "ユーザーセグメント内のタンパク質目標達成率を現在の62%から80%に向上"
    );
    expect(firstProposal.expectedEffect.qualitativeEffect).toBe(
      "栄養状態の改善による体調向上の主観的満足度向上"
    );

    expect(firstProposal.kpiContribution).toBeDefined();
    expect(firstProposal.kpiContribution.affectedKpis).toHaveLength(2);

    const firstKpi = firstProposal.kpiContribution.affectedKpis[0];
    expect(firstKpi.kpiName).toBe("nutrition_achievement_rate");
    expect(firstKpi.currentValue).toBe(62);
    expect(firstKpi.targetValue).toBe(80);
    expect(firstKpi.expectedImprovementAbsolute).toBe(18);
    expect(firstKpi.estimatedImpactPercentageToOkr).toBe(2.8);

    const secondKpi = firstProposal.kpiContribution.affectedKpis[1];
    expect(secondKpi.kpiName).toBe("user_satisfaction_score");
    expect(secondKpi.currentValue).toBe(72);
    expect(secondKpi.targetValue).toBe(78);
    expect(secondKpi.expectedImprovementAbsolute).toBe(6);
    expect(secondKpi.estimatedImpactPercentageToOkr).toBe(1.5);

    expect(firstProposal.priorityScore).toBe(7.33);
    expect(firstProposal.priorityRank).toBe("high");

    const secondProposal = proposalDocument.proposals[1];
    expect(secondProposal.id).toBe("IMP-002");
    expect(secondProposal.title).toBe("調理時間予測アルゴリズムの精度向上");

    expect(secondProposal.implementationEstimate).toBeDefined();
    expect(secondProposal.implementationEstimate.workDays).toBe(12);
    expect(secondProposal.implementationEstimate.personDays).toBe(36);
    expect(secondProposal.implementationEstimate.estimatedCostYen).toBe(540000);

    expect(secondProposal.expectedEffect).toBeDefined();
    expect(secondProposal.expectedEffect.quantitativeEffect).toBe(
      "献立却下率を現在の18%から12%に低下"
    );
    expect(secondProposal.expectedEffect.qualitativeEffect).toBe(
      "ユーザーの献立への信頼度向上、リピート利用率の増加"
    );

    expect(secondProposal.kpiContribution.affectedKpis).toHaveLength(2);
    const secondProposalFirstKpi =
      secondProposal.kpiContribution.affectedKpis[0];
    expect(secondProposalFirstKpi.kpiName).toBe("menu_rejection_rate");
    expect(secondProposalFirstKpi.currentValue).toBe(18);
    expect(secondProposalFirstKpi.targetValue).toBe(12);
    expect(secondProposalFirstKpi.expectedImprovementAbsolute).toBe(-6);
    expect(secondProposalFirstKpi.estimatedImpactPercentageToOkr).toBe(3.2);

    expect(secondProposal.priorityScore).toBe(5.33);
    expect(secondProposal.priorityRank).toBe("medium");

    expect(proposalDocument.generatedDocumentFormat).toBe("structured_json");
    expect(proposalDocument.isExportable).toBe(true);
    expect(proposalDocument.supportedExportFormats).toContain("json");
    expect(proposalDocument.supportedExportFormats).toContain("pdf");
    expect(proposalDocument.supportedExportFormats).toContain("csv");
  });
});