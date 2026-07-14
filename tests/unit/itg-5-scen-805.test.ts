import { calculateExternalDataTrustworthiness } from "../../src/logic/it-7-2-1";

describe("External Data Trustworthiness Score and Adoption Judgment", () => {
  // SCEN-805
  test("should exclude external data with trustworthiness score below adoption threshold and initiate alternative data search flow", () => {
    // Initialization: External factor data setup
    const externalDataWithLowTrust = {
      dataSourceId: "weather_api_001",
      dataType: "temperature",
      value: 28.5,
      collectedAt: new Date("2024-01-15T10:00:00Z"),
      dataQuality: 0.35, // 35% quality
      completenessRatio: 0.60, // 60% complete
      freshness: 0.45, // 45% freshness score
    };

    const externalDataWithHighTrust = {
      dataSourceId: "weather_api_002",
      dataType: "humidity",
      value: 65.0,
      collectedAt: new Date("2024-01-15T10:15:00Z"),
      dataQuality: 0.88,
      completenessRatio: 0.95,
      freshness: 0.92,
    };

    const adoptionThreshold = 0.70; // 70% threshold

    // Execute trustworthiness score calculation
    const resultLowTrust = calculateExternalDataTrustworthiness(
      externalDataWithLowTrust,
      adoptionThreshold
    );

    const resultHighTrust = calculateExternalDataTrustworthiness(
      externalDataWithHighTrust,
      adoptionThreshold
    );

    // Verify low trust data is excluded
    expect(resultLowTrust.trustworthinessScore).toBe(0.467); // (0.35 + 0.60 + 0.45) / 3 = 0.467
    expect(resultLowTrust.isAdopted).toBe(false);
    expect(resultLowTrust.adoptionReason).toBe("信頼度スコアが採用閾値以下");
    expect(resultLowTrust.alternativeSearchTriggered).toBe(true);
    expect(resultLowTrust.alternativeSearchFlowId).toBeDefined();
    expect(resultLowTrust.auditLog).toBeDefined();
    expect(resultLowTrust.auditLog.timestamp).toEqual(
      new Date("2024-01-15T10:00:00Z")
    );
    expect(resultLowTrust.auditLog.action).toBe("外部データ除外");
    expect(resultLowTrust.auditLog.dataSourceId).toBe("weather_api_001");
    expect(resultLowTrust.auditLog.calculatedScore).toBe(0.467);
    expect(resultLowTrust.auditLog.threshold).toBe(adoptionThreshold);

    // Verify high trust data is adopted
    expect(resultHighTrust.trustworthinessScore).toBe(0.917); // (0.88 + 0.95 + 0.92) / 3 = 0.917
    expect(resultHighTrust.isAdopted).toBe(true);
    expect(resultHighTrust.adoptionReason).toBe("信頼度スコアが採用閾値以上");
    expect(resultHighTrust.alternativeSearchTriggered).toBe(false);
    expect(resultHighTrust.alternativeSearchFlowId).toBeNull();

    // Verify alternative data search flow initiation for low trust data
    expect(resultLowTrust.alternativeSearchStatus).toBe("起動済み");
    expect(resultLowTrust.alternativeSearchFallbackDataSourceId).toBe(
      "weather_api_002"
    );

    // Verify audit trail is recorded
    expect(resultLowTrust.auditLog.exclusionReason).toBe(
      "データ品質・完全性・鮮度スコアの組合せが閾値未満"
    );
    expect(resultLowTrust.auditLog.exclusionDetails).toEqual({
      dataQuality: 0.35,
      completenessRatio: 0.60,
      freshness: 0.45,
      calculatedAverage: 0.467,
      adoptionThreshold: 0.70,
    });

    // Verify subsequent algorithm verification continues with alternative data
    expect(resultLowTrust.continueWithAlternativeData).toBe(true);
  });
});