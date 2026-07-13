import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  executeMonthlyAnalysisCycle,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("Monthly Analysis Cycle Execution Scheduling", () => {
  // SCEN-444
  test("should complete monthly analysis within 7 days and set completion flag correctly", () => {
    const start_timestamp = new Date("2024-01-31T21:00:00Z");
    const cycle_id = "cycle_2024_01";
    const user_id = "user_001";
    const min_sample_count = 10;

    const result = executeMonthlyAnalysisCycle({
      cycle_id,
      user_id,
      start_timestamp,
      min_sample_count,
    });

    const completion_timestamp = result.completion_timestamp;
    const elapsed_seconds =
      (completion_timestamp.getTime() - start_timestamp.getTime()) / 1000;
    const max_allowed_seconds = 7 * 24 * 60 * 60;

    expect(result.cycle_id).toBe("cycle_2024_01");
    expect(result.user_id).toBe("user_001");
    expect(result.status).toBe("completed");
    expect(result.completion_flag).toBe(true);

    expect(elapsed_seconds).toBeLessThanOrEqual(max_allowed_seconds);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.completion_timestamp).toEqual(completion_timestamp);
    expect(typeof result.metadata.processing_time_seconds).toBe("number");
    expect(result.metadata.processing_time_seconds).toBeGreaterThan(0);
    expect(result.metadata.processing_time_seconds).toBeLessThanOrEqual(
      max_allowed_seconds
    );

    expect(result.scheduler_log).toBeDefined();
    expect(result.scheduler_log.message).toMatch(/completed/i);
    expect(result.scheduler_log.level).toBe("info");
    expect(result.scheduler_log.timestamp).toBeDefined();

    expect(result.data_collection_status).toBe("completed");
    expect(result.nutrition_analysis_status).toBe("completed");
    expect(result.report_generation_status).toBe("completed");

    expect(result.collected_record_count).toBeGreaterThanOrEqual(
      min_sample_count
    );
  });
});