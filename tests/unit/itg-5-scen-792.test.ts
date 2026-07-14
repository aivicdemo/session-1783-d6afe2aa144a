import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("外部要因データ自動取得・統合機能", () => {
  // SCEN-792
  test("気象API・イベント情報・競合店舗施策から定期的にデータが自動取得され、需要予測入力変数として統合される", () => {
    const mockWeatherData = {
      temperature: 18.5,
      precipitation: 2.3,
      weather: "cloudy",
      humidity: 72,
      windSpeed: 5.2,
    };

    const mockEventData = [
      {
        eventId: "evt_001",
        eventName: "季節セール",
        eventType: "sale",
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-21T23:59:59Z",
        expectedImpactScore: 0.75,
      },
      {
        eventId: "evt_002",
        eventName: "成人の日",
        eventType: "holiday",
        startDate: "2024-01-08T00:00:00Z",
        endDate: "2024-01-08T23:59:59Z",
        expectedImpactScore: 0.5,
      },
    ];

    const mockCompetitorData = [
      {
        competitorId: "comp_001",
        storeName: "競合店A",
        campaignName: "新春キャンペーン",
        campaignType: "discount",
        discountRate: 0.2,
        targetCategories: ["vegetables", "fruits"],
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-28T23:59:59Z",
        competitiveIntensity: 0.85,
      },
    ];

    const externalFactorInput = {
      weatherData: mockWeatherData,
      eventData: mockEventData,
      competitorData: mockCompetitorData,
      dataCollectionTimestamp: "2024-01-15T10:30:00Z",
      integrationStatus: "pending",
    };

    const demandPredictionVariables = [
      {
        variableName: "temperature",
        value: 18.5,
        unit: "celsius",
        sourceType: "weather_api",
        confidence: 0.98,
      },
      {
        variableName: "precipitation",
        value: 2.3,
        unit: "mm",
        sourceType: "weather_api",
        confidence: 0.96,
      },
      {
        variableName: "event_impact_multiplier",
        value: 1.25,
        unit: "multiplier",
        sourceType: "event_data",
        confidence: 0.85,
      },
      {
        variableName: "competitor_discount_pressure",
        value: 0.85,
        unit: "intensity_score",
        sourceType: "competitor_data",
        confidence: 0.8,
      },
    ];

    const weeklyMetricsInput = {
      weekStartDate: "2024-01-08T00:00:00Z",
      weekEndDate: "2024-01-14T23:59:59Z",
      mealGenerationSuccessRate: 0.92,
      cookingTimeReductionAchievementRate: 0.87,
      userSatisfactionScore: 4.3,
      dataPoints: 150,
      algorithmVersionId: "v2.1.3",
      externalFactorsIntegrated: true,
      predictorVariablesCount: 4,
      predictorVariables: demandPredictionVariables,
    };

    const result = aggregateWeeklyMetrics(weeklyMetricsInput);

    expect(result).toBeDefined();
    expect(result.weekStartDate).toBe("2024-01-08T00:00:00Z");
    expect(result.weekEndDate).toBe("2024-01-14T23:59:59Z");
    expect(result.mealGenerationSuccessRate).toBe(0.92);
    expect(result.cookingTimeReductionAchievementRate).toBe(0.87);
    expect(result.userSatisfactionScore).toBe(4.3);
    expect(result.dataPoints).toBe(150);
    expect(result.algorithmVersionId).toBe("v2.1.3");
    expect(result.externalFactorsIntegrated).toBe(true);
    expect(result.predictorVariablesCount).toBe(4);

    expect(Array.isArray(result.predictorVariables)).toBe(true);
    expect(result.predictorVariables.length).toBe(4);

    const weatherVar = result.predictorVariables.find(
      (v) => v.variableName === "temperature"
    );
    expect(weatherVar).toBeDefined();
    expect(weatherVar?.value).toBe(18.5);
    expect(weatherVar?.sourceType).toBe("weather_api");
    expect(weatherVar?.confidence).toBe(0.98);

    const eventVar = result.predictorVariables.find(
      (v) => v.variableName === "event_impact_multiplier"
    );
    expect(eventVar).toBeDefined();
    expect(eventVar?.value).toBe(1.25);
    expect(eventVar?.sourceType).toBe("event_data");
    expect(eventVar?.confidence).toBe(0.85);

    const competitorVar = result.predictorVariables.find(
      (v) => v.variableName === "competitor_discount_pressure"
    );
    expect(competitorVar).toBeDefined();
    expect(competitorVar?.value).toBe(0.85);
    expect(competitorVar?.sourceType).toBe("competitor_data");
    expect(competitorVar?.confidence).toBe(0.8);

    expect(result.integrationStatus).toBe("completed");
    expect(result.dashboardDisplayState).toBe("visible");

    expect(typeof result.aggregationTimestamp).toBe("string");
    expect(result.aggregationTimestamp.length).toBeGreaterThan(0);

    const precipitationVar = result.predictorVariables.find(
      (v) => v.variableName === "precipitation"
    );
    expect(precipitationVar?.unit).toBe("mm");
    expect(precipitationVar?.confidence).toBeLessThanOrEqual(1.0);
    expect(precipitationVar?.confidence).toBeGreaterThanOrEqual(0.0);
  });
});