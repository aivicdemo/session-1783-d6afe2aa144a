import { determineMonthlyAnalysisTiming, issueDataCollectionInstruction } from "../../src/logic/it-2";

describe("Family member meal evaluation data collection and management", () => {
  // SCEN-527: [normal] データ収集指示発行機能 - 月次分析タイミング判定後にデータ抽出範囲が月単位で正しく確定される
  test("should confirm monthly analysis timing and correctly determine data extraction range for the month", () => {
    // Setup: Current date is set to the last day of the month (2024-01-31)
    const currentDate = new Date("2024-01-31T09:00:00Z");
    const expectedMonthStart = new Date("2024-01-01T00:00:00Z");
    const expectedMonthEnd = new Date("2024-01-31T23:59:59Z");

    // Execute: Determine if current date matches monthly analysis timing
    const timingResult = determineMonthlyAnalysisTiming({
      currentDate: currentDate,
      analysisExecutionDay: 31,
    });

    // Assert: Timing determination result should indicate monthly analysis should execute
    expect(timingResult.shouldExecute).toBe(true);
    expect(timingResult.analysisType).toBe("monthly");
    expect(timingResult.message).toMatch(/月次分析実行タイミング/);

    // Execute: Issue data collection instruction with confirmed timing
    const collectionInstructionResult = issueDataCollectionInstruction({
      analysisType: "monthly",
      targetMonth: new Date("2024-01-15T00:00:00Z"),
      userSegments: ["segment_A", "segment_B"],
    });

    // Assert: Data extraction range should be automatically determined to first day through last day of month
    expect(collectionInstructionResult.instructionId).toBeDefined();
    expect(collectionInstructionResult.extractionStartDate).toEqual(expectedMonthStart);
    expect(collectionInstructionResult.extractionEndDate).toEqual(expectedMonthEnd);

    // Assert: Extracted month span should be exactly one calendar month
    const durationDays =
      (collectionInstructionResult.extractionEndDate.getTime() -
        collectionInstructionResult.extractionStartDate.getTime()) /
      (1000 * 60 * 60 * 24);
    expect(durationDays).toBe(30); // January has 31 days, so 31 - 1 = 30 days span

    // Assert: Data collection instruction parameters should be correctly stored
    expect(collectionInstructionResult.status).toBe("issued");
    expect(collectionInstructionResult.targetUserSegments).toEqual([
      "segment_A",
      "segment_B",
    ]);
    expect(collectionInstructionResult.collectionScope).toBe("monthly_full_range");

    // Assert: Confirm data extraction will be executed within the determined monthly range
    expect(collectionInstructionResult.isRangeConfirmed).toBe(true);
    expect(collectionInstructionResult.rangeConfirmedAt).toBeDefined();
  });
});