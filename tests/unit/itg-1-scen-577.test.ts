import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  validateRuleSpecDistributionFlow,
} from "../../src/logic/it-1-1-1";

const fetchMock = require("jest-fetch-mock");

describe("ルール仕様承認フロー自動進行 - 配布タイムスタンプと協議会開催日の一致検証", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // SCEN-577
  test("配布タイムスタンプが協議会開催日と一致する場合、承認フローが正常に自動進行する", async () => {
    const meetingDate = new Date("2024-01-15T14:00:00Z");
    const distributionTimestamp = new Date("2024-01-15T14:00:00Z");

    const ruleSpecData = {
      specId: "RULE_SPEC_2024_Q1_001",
      distributionTimestamp: distributionTimestamp.toISOString(),
      meetingDate: meetingDate.toISOString(),
      specTitle: "季節パターン・割引率閾値・販売期間の優先度ルール",
      proposalStatus: "pending",
      proposalCompletedAt: null,
      reviewStatus: "pending",
      reviewCompletedAt: null,
      approvalStatus: "pending",
      approvalCompletedAt: null,
      finalApprovalStatus: "pending",
      finalApprovalCompletedAt: null,
      notificationSent: false,
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        specId: ruleSpecData.specId,
        timestampMatch: true,
        proposalStepCompleted: true,
        proposalCompletedAt: "2024-01-15T14:05:00Z",
        reviewStepCompleted: true,
        reviewCompletedAt: "2024-01-15T14:10:00Z",
        approvalStepCompleted: true,
        approvalCompletedAt: "2024-01-15T14:15:00Z",
        finalApprovalStatus: "approved",
        finalApprovalCompletedAt: "2024-01-15T14:20:00Z",
        notificationSent: true,
        notificationTimestamp: "2024-01-15T14:20:30Z",
      }),
      { status: 200 }
    );

    const result = await validateRuleSpecDistributionFlow({
      specId: ruleSpecData.specId,
      distributionTimestamp: ruleSpecData.distributionTimestamp,
      meetingDate: ruleSpecData.meetingDate,
      specTitle: ruleSpecData.specTitle,
    });

    expect(result.success).toBe(true);
    expect(result.timestampMatch).toBe(true);
    expect(result.proposalStepCompleted).toBe(true);
    expect(result.proposalCompletedAt).toBe("2024-01-15T14:05:00Z");
    expect(result.reviewStepCompleted).toBe(true);
    expect(result.reviewCompletedAt).toBe("2024-01-15T14:10:00Z");
    expect(result.approvalStepCompleted).toBe(true);
    expect(result.approvalCompletedAt).toBe("2024-01-15T14:15:00Z");
    expect(result.finalApprovalStatus).toBe("approved");
    expect(result.finalApprovalCompletedAt).toBe("2024-01-15T14:20:00Z");
    expect(result.notificationSent).toBe(true);
    expect(result.notificationTimestamp).toBe("2024-01-15T14:20:30Z");

    const stepSequence = [
      result.proposalCompletedAt,
      result.reviewCompletedAt,
      result.approvalCompletedAt,
      result.finalApprovalCompletedAt,
    ];

    for (let i = 0; i < stepSequence.length - 1; i++) {
      const currentStepTime = new Date(stepSequence[i]).getTime();
      const nextStepTime = new Date(stepSequence[i + 1]).getTime();
      expect(currentStepTime).toBeLessThan(nextStepTime);
    }

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/approve-flow"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });
});