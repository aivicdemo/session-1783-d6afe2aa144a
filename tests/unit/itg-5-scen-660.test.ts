import { describe, test, expect } from "@jest/globals";
import {
  determineSegmentedRolloutPlan,
} from "../../src/logic/it-7-2-1";

describe("段階的ロールアウト制御機能 - セグメント別配信と検証期間の決定", () => {
  // SCEN-660
  test("新アルゴリズムバージョンのユーザーセグメント別配信と検証期間が正常に決定される", () => {
    const algorithmVersionId = "v2.0";
    const totalUserCount = 10000;
    const segmentAnalysisData = [
      {
        segmentId: "seg_light_users",
        segmentName: "ライトユーザー",
        userCount: 3000,
        engagementLevel: "low",
        riskScore: 0.2,
      },
      {
        segmentId: "seg_heavy_users",
        segmentName: "ヘビーユーザー",
        userCount: 5000,
        engagementLevel: "high",
        riskScore: 0.7,
      },
      {
        segmentId: "seg_new_users",
        segmentName: "新規ユーザー",
        userCount: 2000,
        engagementLevel: "medium",
        riskScore: 0.5,
      },
    ];

    const result = determineSegmentedRolloutPlan({
      algorithmVersionId,
      totalUserCount,
      segmentAnalysisData,
    });

    expect(result.algorithmVersionId).toBe("v2.0");
    expect(result.rolloutPlan).toHaveLength(3);

    const lightUserSegment = result.rolloutPlan.find(
      (plan) => plan.segmentId === "seg_light_users"
    );
    expect(lightUserSegment).toBeDefined();
    expect(lightUserSegment!.segmentName).toBe("ライトユーザー");
    expect(lightUserSegment!.distributionRatio).toBe(0.05);
    expect(lightUserSegment!.targetUserCount).toBe(500);
    expect(lightUserSegment!.verificationDays).toBe(7);
    expect(lightUserSegment!.startDate).toBe("2024-01-15");
    expect(lightUserSegment!.endDate).toBe("2024-01-22");
    expect(lightUserSegment!.riskLevel).toBe("low");

    const heavyUserSegment = result.rolloutPlan.find(
      (plan) => plan.segmentId === "seg_heavy_users"
    );
    expect(heavyUserSegment).toBeDefined();
    expect(heavyUserSegment!.segmentName).toBe("ヘビーユーザー");
    expect(heavyUserSegment!.distributionRatio).toBe(0.3);
    expect(heavyUserSegment!.targetUserCount).toBe(3000);
    expect(heavyUserSegment!.verificationDays).toBe(30);
    expect(heavyUserSegment!.startDate).toBe("2024-01-29");
    expect(heavyUserSegment!.endDate).toBe("2024-02-28");
    expect(heavyUserSegment!.riskLevel).toBe("high");

    const newUserSegment = result.rolloutPlan.find(
      (plan) => plan.segmentId === "seg_new_users"
    );
    expect(newUserSegment).toBeDefined();
    expect(newUserSegment!.segmentName).toBe("新規ユーザー");
    expect(newUserSegment!.distributionRatio).toBe(0.15);
    expect(newUserSegment!.targetUserCount).toBe(1500);
    expect(newUserSegment!.verificationDays).toBe(14);
    expect(newUserSegment!.startDate).toBe("2024-01-22");
    expect(newUserSegment!.endDate).toBe("2024-02-05");
    expect(newUserSegment!.riskLevel).toBe("medium");

    expect(result.totalDistributionRatio).toBe(0.5);
    expect(result.totalTargetUserCount).toBe(5000);
    expect(result.status).toBe("planned");
    expect(result.createdAt).toBe("2024-01-15T09:00:00Z");
  });
});