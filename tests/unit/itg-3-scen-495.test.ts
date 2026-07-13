import { generateQuarterlyConferencePreparation } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-495: [edge] 四半期協議会事前準備自動生成機能 - 協議会開催日が前回協議会から 89 日目の場合、準備自動生成が実行される
  test("should generate quarterly conference preparation automatically when 89 days have elapsed since last conference", () => {
    // Arrange
    const last_conference_date = new Date("2024-01-01T00:00:00Z");
    const current_date = new Date("2024-03-31T00:00:00Z");
    const days_elapsed = Math.floor(
      (current_date.getTime() - last_conference_date.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const input = {
      last_conference_date: last_conference_date,
      current_date: current_date,
      user_id: "user_123",
      distributor_ids: ["dist_001", "dist_002"],
      supermarket_ids: ["super_001", "super_002"],
    };

    // Assert: Days elapsed is exactly 89
    expect(days_elapsed).toBe(89);

    // Act
    const result = generateQuarterlyConferencePreparation(input);

    // Assert: Generation status is completed
    expect(result.generation_status).toBe("completed");

    // Assert: Preparation materials are generated
    expect(result.preparation_materials).toBeDefined();
    expect(result.preparation_materials.agenda_list).toBeDefined();
    expect(result.preparation_materials.agenda_list.length).toBeGreaterThan(0);

    // Assert: Budget analysis is included
    expect(result.preparation_materials.budget_analysis).toBeDefined();
    expect(result.preparation_materials.budget_analysis.total_budget).toBeDefined();
    expect(typeof result.preparation_materials.budget_analysis.total_budget).toBe(
      "number"
    );

    // Assert: Expenditure trend report is included
    expect(result.preparation_materials.expenditure_trend_report).toBeDefined();
    expect(
      result.preparation_materials.expenditure_trend_report.trend_data
    ).toBeDefined();

    // Assert: Generated materials are available for use
    expect(result.is_available_for_use).toBe(true);

    // Assert: Generation timestamp is recorded
    expect(result.generated_at).toBeDefined();
    expect(typeof result.generated_at).toBe("object");

    // Assert: Conference date is correctly set
    expect(result.next_conference_date).toBeDefined();
    const next_conf_date = new Date(result.next_conference_date);
    const days_until_next = Math.floor(
      (next_conf_date.getTime() - current_date.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    expect(days_until_next).toBe(91); // Next quarter in approximately 91 days

    // Assert: Preparation includes participant list
    expect(result.preparation_materials.participant_list).toBeDefined();
    expect(Array.isArray(result.preparation_materials.participant_list)).toBe(
      true
    );

    // Assert: Preparation includes discussion topics
    expect(result.preparation_materials.discussion_topics).toBeDefined();
    expect(Array.isArray(result.preparation_materials.discussion_topics)).toBe(
      true
    );
    expect(
      result.preparation_materials.discussion_topics.length
    ).toBeGreaterThan(0);

    // Assert: Seasonal pattern update document is included
    expect(
      result.preparation_materials.seasonal_pattern_update_doc
    ).toBeDefined();

    // Assert: Discount rate threshold update document is included
    expect(
      result.preparation_materials.discount_rate_threshold_update_doc
    ).toBeDefined();

    // Assert: Sales period update document is included
    expect(result.preparation_materials.sales_period_update_doc).toBeDefined();

    // Assert: Error log is empty for successful execution
    expect(result.error_log).toEqual([]);

    // Assert: Execution time is reasonable
    expect(result.execution_time_ms).toBeLessThan(5000);
  });
});