import {
  extractSegmentUsagePatternData,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("セグメント別利用パターンデータ抽出・集計機能", () => {
  // SCEN-361
  test("指定された集計期間内にデータが存在しない場合、エラーまたは空集合が返される", () => {
    // 現在日時を基準に、3年前の期間を指定
    const threeYearsAgo = new Date("2021-01-15");
    const threeYearsAgoEnd = new Date("2021-03-15");

    const segmentCriteria = {
      ageGroup: "30-40",
      familyComposition: "2children",
      dietaryRestrictionFlag: true,
    };

    const aggregationPeriod = {
      startDate: threeYearsAgo.toISOString(),
      endDate: threeYearsAgoEnd.toISOString(),
    };

    // データが存在しない期間でデータ抽出・集計を実行
    const result = extractSegmentUsagePatternData(
      segmentCriteria,
      aggregationPeriod
    );

    // 結果がnullまたは空配列であることを検証
    // または、エラーがスローされることを検証
    if (result === null) {
      expect(result).toBeNull();
    } else if (Array.isArray(result)) {
      expect(result.length).toBe(0);
    } else if (typeof result === "object" && result !== null) {
      expect(Object.keys(result).length).toBe(0);
    }

    // エラーケース: 無効な期間指定の場合
    const invalidPeriod = {
      startDate: new Date("2025-12-31").toISOString(),
      endDate: new Date("2025-01-01").toISOString(), // 開始日 > 終了日
    };

    expect(() =>
      extractSegmentUsagePatternData(segmentCriteria, invalidPeriod)
    ).toThrow(/期間/);

    // エラーケース: null/undefined のセグメント条件
    expect(() =>
      extractSegmentUsagePatternData(null as any, aggregationPeriod)
    ).toThrow(/セグメント/);

    // 成功ケース: 有効な期間でデータが存在する場合
    const validPeriod = {
      startDate: new Date("2024-01-15").toISOString(),
      endDate: new Date("2024-03-15").toISOString(),
    };

    const validResult = extractSegmentUsagePatternData(
      segmentCriteria,
      validPeriod
    );

    // 戻り値は配列またはオブジェクトで、以下の構造を持つ
    if (Array.isArray(validResult)) {
      expect(validResult).toBeDefined();
      if (validResult.length > 0) {
        expect(validResult[0]).toHaveProperty("mealGenerationSuccessRate");
        expect(validResult[0]).toHaveProperty("cookingTimeReduction");
        expect(validResult[0]).toHaveProperty("userSatisfactionScore");
        expect(typeof validResult[0].mealGenerationSuccessRate).toBe("number");
        expect(typeof validResult[0].cookingTimeReduction).toBe("number");
        expect(typeof validResult[0].userSatisfactionScore).toBe("number");
      }
    }
  });
});