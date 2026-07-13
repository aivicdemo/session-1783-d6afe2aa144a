import {
  analyzeExternalDataCorrelation,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("外部データ相関分析による予測精度低下要因特定", () => {
  // SCEN-373
  test("複数の外部要因の相関が統合分析され、改善優先度が根拠付けられる", () => {
    const analysisInput = {
      userId: "user_123",
      externalFactors: [
        {
          factorType: "weather",
          factorName: "天候",
          correlationCoefficient: 0.72,
          impactScore: 8.5,
        },
        {
          factorType: "temperature",
          factorName: "気温",
          correlationCoefficient: 0.65,
          impactScore: 7.2,
        },
        {
          factorType: "dayOfWeek",
          factorName: "曜日",
          correlationCoefficient: 0.58,
          impactScore: 6.8,
        },
        {
          factorType: "eventStatus",
          factorName: "イベント開催状況",
          correlationCoefficient: 0.51,
          impactScore: 5.9,
        },
      ],
      accuracyDeclinePeriod: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
      accuracyThreshold: 0.75,
    };

    const result = analyzeExternalDataCorrelation(analysisInput);

    expect(result).toBeDefined();
    expect(result.userId).toBe("user_123");
    expect(result.analysisStatus).toBe("completed");

    expect(result.correlationResults).toBeDefined();
    expect(result.correlationResults.length).toBe(4);

    const sortedByCorrelation = result.correlationResults.sort(
      (a, b) => b.correlationCoefficient - a.correlationCoefficient
    );
    expect(sortedByCorrelation[0].factorName).toBe("天候");
    expect(sortedByCorrelation[0].correlationCoefficient).toBe(0.72);
    expect(sortedByCorrelation[1].factorName).toBe("気温");
    expect(sortedByCorrelation[1].correlationCoefficient).toBe(0.65);
    expect(sortedByCorrelation[2].factorName).toBe("曜日");
    expect(sortedByCorrelation[2].correlationCoefficient).toBe(0.58);
    expect(sortedByCorrelation[3].factorName).toBe("イベント開催状況");
    expect(sortedByCorrelation[3].correlationCoefficient).toBe(0.51);

    expect(result.priorityRanking).toBeDefined();
    expect(result.priorityRanking.length).toBe(4);

    const topPriority = result.priorityRanking[0];
    expect(topPriority.rank).toBe(1);
    expect(topPriority.factorName).toBe("天候");
    expect(topPriority.priorityScore).toBeGreaterThan(0);
    expect(topPriority.justification).toBeDefined();
    expect(topPriority.justification.correlationCoefficient).toBe(0.72);
    expect(topPriority.justification.impactScore).toBe(8.5);

    const secondPriority = result.priorityRanking[1];
    expect(secondPriority.rank).toBe(2);
    expect(secondPriority.factorName).toBe("気温");
    expect(secondPriority.priorityScore).toBeGreaterThan(0);
    expect(secondPriority.justification.correlationCoefficient).toBe(0.65);
    expect(secondPriority.justification.impactScore).toBe(7.2);

    const thirdPriority = result.priorityRanking[2];
    expect(thirdPriority.rank).toBe(3);
    expect(thirdPriority.factorName).toBe("曜日");

    const fourthPriority = result.priorityRanking[3];
    expect(fourthPriority.rank).toBe(4);
    expect(fourthPriority.factorName).toBe("イベント開催状況");

    expect(result.exportFormats).toBeDefined();
    expect(result.exportFormats).toContain("report");
    expect(result.exportFormats).toContain("csv");

    expect(result.reportData).toBeDefined();
    expect(result.reportData.period).toEqual({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
    expect(result.reportData.totalFactorsAnalyzed).toBe(4);
    expect(result.reportData.significantFactorsIdentified).toBeGreaterThanOrEqual(
      1
    );

    expect(result.csvExportPath).toBeDefined();
    expect(typeof result.csvExportPath).toBe("string");

    const integratedScore =
      (0.72 * 8.5 + 0.65 * 7.2 + 0.58 * 6.8 + 0.51 * 5.9) /
      (0.72 + 0.65 + 0.58 + 0.51);
    expect(result.integratedAnalysisScore).toBeCloseTo(integratedScore, 2);

    expect(result.improvementRecommendations).toBeDefined();
    expect(result.improvementRecommendations.length).toBeGreaterThan(0);
    expect(
      result.improvementRecommendations[0].recommendationText
    ).toBeDefined();
    expect(result.improvementRecommendations[0].expectedImpact).toBeDefined();

    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
      new Date().getTime()
    );
  });
});