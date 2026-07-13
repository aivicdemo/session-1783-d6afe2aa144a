import { describe, it, expect, beforeEach } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import { distributeRuleSpecification } from "../../src/logic/it-1-br-3-2-1";

fetchMock.enableMocks();

describe("Rule Specification Distribution and Recipient Tracking", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-480
  it("should skip distribution and return error when recipient list is empty", async () => {
    const ruleSpecId = "RULE-SPEC-2024-Q1";
    const specificationTitle = "Seasonal Pattern and Discount Rate Rules Q1";
    const recipientList: string[] = [];
    const distributionTimestamp = new Date("2024-01-15T09:00:00Z");

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: "error",
        code: 400,
        message: "配布対象者が指定されていません",
        ruleSpecId: ruleSpecId,
        recipientCount: 0,
        distributionSkipped: true,
        logRecorded: false,
      }),
      { status: 400 }
    );

    const result = await distributeRuleSpecification({
      ruleSpecId: ruleSpecId,
      specificationTitle: specificationTitle,
      recipientList: recipientList,
      distributionTimestamp: distributionTimestamp,
    });

    expect(result.status).toBe("error");
    expect(result.code).toBe(400);
    expect(result.message).toMatch(/配布対象者/);
    expect(result.distributionSkipped).toBe(true);
    expect(result.logRecorded).toBe(false);
    expect(result.recipientCount).toBe(0);
  });
});