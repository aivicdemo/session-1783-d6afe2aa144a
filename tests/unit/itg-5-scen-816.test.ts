import { describe, test, expect } from "@jest/globals";
import {
  integratePriorityRuleSpecification,
} from "../../src/logic/it-7-2-1";

describe("季節パターン・割引率・販売期間ルール統合機能", () => {
  // SCEN-816
  test("協議会で提示された季節パターン・割引率閾値・販売期間が優先度ルール仕様書に正しく統合される", () => {
    const seasonalPatterns = [
      {
        seasonId: "SPRING",
        seasonName: "春季",
        startMonth: 3,
        endMonth: 5,
        priorityScore: 85,
      },
      {
        seasonId: "SUMMER",
        seasonName: "夏季",
        startMonth: 6,
        endMonth: 8,
        priorityScore: 90,
      },
      {
        seasonId: "AUTUMN",
        seasonName: "秋季",
        startMonth: 9,
        endMonth: 11,
        priorityScore: 80,
      },
      {
        seasonId: "WINTER",
        seasonName: "冬季",
        startMonth: 12,
        endMonth: 2,
        priorityScore: 75,
      },
    ];

    const discountRateThresholds = [
      {
        thresholdId: "TIER_1",
        minDiscountRate: 0,
        maxDiscountRate: 10,
        priorityScore: 50,
      },
      {
        thresholdId: "TIER_2",
        minDiscountRate: 11,
        maxDiscountRate: 25,
        priorityScore: 70,
      },
      {
        thresholdId: "TIER_3",
        minDiscountRate: 26,
        maxDiscountRate: 40,
        priorityScore: 95,
      },
      {
        thresholdId: "TIER_4",
        minDiscountRate: 41,
        maxDiscountRate: 100,
        priorityScore: 100,
      },
    ];

    const salesPeriodRules = [
      {
        ruleId: "RULE_001",
        itemType: "FRESH_VEGETABLES",
        salesStartDate: "2024-03-01",
        salesEndDate: "2024-05-31",
        restrictionCondition: "在庫充足度70%以上",
        priorityScore: 85,
      },
      {
        ruleId: "RULE_002",
        itemType: "SEASONAL_FRUITS",
        salesStartDate: "2024-06-01",
        salesEndDate: "2024-08-31",
        restrictionCondition: "在庫充足度60%以上",
        priorityScore: 88,
      },
      {
        ruleId: "RULE_003",
        itemType: "HARVEST_CROPS",
        salesStartDate: "2024-09-01",
        salesEndDate: "2024-11-30",
        restrictionCondition: "在庫充足度75%以上",
        priorityScore: 82,
      },
      {
        ruleId: "RULE_004",
        itemType: "PRESERVED_FOODS",
        salesStartDate: "2024-12-01",
        salesEndDate: "2025-02-28",
        restrictionCondition: "在庫充足度50%以上",
        priorityScore: 78,
      },
    ];

    const integrationTimestamp = new Date("2024-10-15T09:30:00Z");
    const specificationVersion = "v2.1";
    const conferenceId = "CONF_2024_Q4";

    const result = integratePriorityRuleSpecification({
      seasonalPatterns,
      discountRateThresholds,
      salesPeriodRules,
      integrationTimestamp,
      specificationVersion,
      conferenceId,
    });

    expect(result.integrationStatus).toBe("SUCCESS");
    expect(result.specificationVersion).toBe("v2.1");
    expect(result.conferenceId).toBe("CONF_2024_Q4");
    expect(result.integratedSeasonalPatterns).toHaveLength(4);
    expect(result.integratedDiscountRateThresholds).toHaveLength(4);
    expect(result.integratedSalesPeriodRules).toHaveLength(4);

    expect(result.integratedSeasonalPatterns[0]).toEqual({
      seasonId: "SPRING",
      seasonName: "春季",
      startMonth: 3,
      endMonth: 5,
      priorityScore: 85,
    });

    expect(result.integratedSeasonalPatterns[1]).toEqual({
      seasonId: "SUMMER",
      seasonName: "夏季",
      startMonth: 6,
      endMonth: 8,
      priorityScore: 90,
    });

    const priorityRanking = result.priorityRanking;
    expect(priorityRanking).toHaveLength(12);

    const tier4Index = priorityRanking.findIndex(
      (item: any) => item.thresholdId === "TIER_4"
    );
    const tier1Index = priorityRanking.findIndex(
      (item: any) => item.thresholdId === "TIER_1"
    );
    expect(tier4Index).toBeLessThan(tier1Index);

    const summerIndex = priorityRanking.findIndex(
      (item: any) => item.seasonId === "SUMMER"
    );
    const winterIndex = priorityRanking.findIndex(
      (item: any) => item.seasonId === "WINTER"
    );
    expect(summerIndex).toBeLessThan(winterIndex);

    expect(result.validationResults).toBeDefined();
    expect(result.validationResults.overlapDetected).toBe(false);
    expect(result.validationResults.inconsistenciesFound).toBe(false);
    expect(result.validationResults.completenessScore).toBe(100);

    expect(result.traceabilityData).toBeDefined();
    expect(result.traceabilityData.createdAt).toBe("2024-10-15T09:30:00Z");
    expect(result.traceabilityData.createdBy).toBe("SYSTEM");
    expect(result.traceabilityData.changeHistory).toHaveLength(1);
    expect(result.traceabilityData.changeHistory[0]).toEqual({
      timestamp: "2024-10-15T09:30:00Z",
      action: "INITIAL_INTEGRATION",
      changedFields: [
        "seasonalPatterns",
        "discountRateThresholds",
        "salesPeriodRules",
      ],
    });

    expect(result.exportFormat).toBeDefined();
    expect(result.exportFormat.format).toBe("JSON");
    expect(result.exportFormat.filename).toMatch(/priority_rule_spec_v2\.1_/);
    expect(result.exportFormat.filesize).toBeGreaterThan(0);

    expect(result.dashboardDisplayData).toBeDefined();
    expect(result.dashboardDisplayData.summaryMetrics).toEqual({
      totalIntegratedRules: 12,
      seasonalPatternsCount: 4,
      discountTiersCount: 4,
      salesPeriodsCount: 4,
      averagePriorityScore: 86.5,
    });

    expect(result.dashboardDisplayData.conflictAlert).toBe(false);
    expect(result.dashboardDisplayData.readinessForDeployment).toBe(true);
  });
});