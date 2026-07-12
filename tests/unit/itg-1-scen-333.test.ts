import { detectAndPrioritizeRestrictionChanges } from "../../src/logic/it-1-1-1";

describe("食事制限・アレルギー情報の変更検出と優先度付け", () => {
  test("SCEN-333: 前回更新から7日経過した情報が優先度付けされて検出される", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    const sevenDaysAgo = new Date("2024-01-08T10:00:00Z");
    const threeDaysAgo = new Date("2024-01-12T10:00:00Z");

    const userProfile = {
      userId: "user-001",
      familyMembers: [
        {
          memberId: "member-001",
          name: "Child A",
          age: 8,
          restrictions: [
            {
              restrictionId: "rest-001",
              type: "vegetarian",
              lastUpdatedAt: sevenDaysAgo,
            },
            {
              restrictionId: "rest-002",
              type: "low-sodium",
              lastUpdatedAt: threeDaysAgo,
            },
          ],
          allergies: [
            {
              allergyId: "allergy-001",
              ingredient: "peanut",
              severity: "severe",
              lastUpdatedAt: sevenDaysAgo,
            },
            {
              allergyId: "allergy-002",
              ingredient: "shellfish",
              severity: "moderate",
              lastUpdatedAt: threeDaysAgo,
            },
          ],
        },
        {
          memberId: "member-002",
          name: "Child B",
          age: 6,
          restrictions: [
            {
              restrictionId: "rest-003",
              type: "dairy-free",
              lastUpdatedAt: threeDaysAgo,
            },
          ],
          allergies: [
            {
              allergyId: "allergy-003",
              ingredient: "egg",
              severity: "mild",
              lastUpdatedAt: new Date("2024-01-10T10:00:00Z"),
            },
          ],
        },
      ],
    };

    const result = detectAndPrioritizeRestrictionChanges({
      userProfile,
      currentDate: now,
      thresholdDays: 7,
    });

    expect(result).toBeDefined();
    expect(result.detectedChanges).toBeDefined();
    expect(Array.isArray(result.detectedChanges)).toBe(true);
    expect(result.detectedChanges.length).toBeGreaterThan(0);

    const highPriorityItems = result.detectedChanges.filter(
      (item) => item.priority === "HIGH"
    );
    expect(highPriorityItems.length).toBe(2);

    const sortedByPriority = result.detectedChanges.sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        HIGH: 0,
        MEDIUM: 1,
        LOW: 2,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    expect(sortedByPriority[0].priority).toBe("HIGH");
    expect(sortedByPriority[1].priority).toBe("HIGH");

    const sevenDayItems = result.detectedChanges.filter(
      (item) => item.lastUpdatedAt.getTime() === sevenDaysAgo.getTime()
    );
    expect(sevenDayItems.length).toBe(2);
    sevenDayItems.forEach((item) => {
      expect(item.priority).toBe("HIGH");
    });

    const sortedByDate = result.detectedChanges.sort(
      (a, b) =>
        new Date(a.lastUpdatedAt).getTime() -
        new Date(b.lastUpdatedAt).getTime()
    );

    for (let i = 1; i < sortedByDate.length; i++) {
      const prevTime = new Date(sortedByDate[i - 1].lastUpdatedAt).getTime();
      const currTime = new Date(sortedByDate[i].lastUpdatedAt).getTime();
      expect(prevTime).toBeLessThanOrEqual(currTime);
    }

    result.detectedChanges.forEach((item) => {
      expect(item.lastUpdatedAt).toBeDefined();
      expect(item.lastUpdatedAt instanceof Date).toBe(true);
      expect(item.memberId).toBeDefined();
      expect(item.type).toMatch(/restriction|allergy/);
      expect(item.priority).toMatch(/HIGH|MEDIUM|LOW/);
    });

    const daysOldestItem = (current: Date, lastUpdated: Date): number => {
      const diffMs = current.getTime() - lastUpdated.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    };

    result.detectedChanges.forEach((item) => {
      const daysOld = daysOldestItem(now, item.lastUpdatedAt);
      if (daysOld >= 7) {
        expect(item.priority).toBe("HIGH");
      } else if (daysOld >= 3) {
        expect(item.priority).toBe("MEDIUM");
      } else {
        expect(item.priority).toBe("LOW");
      }
    });

    expect(result.summary).toBeDefined();
    expect(result.summary.totalDetected).toBe(result.detectedChanges.length);
    expect(result.summary.highPriorityCount).toBe(highPriorityItems.length);
    expect(result.summary.mediumPriorityCount).toBeGreaterThanOrEqual(0);
    expect(result.summary.lowPriorityCount).toBeGreaterThanOrEqual(0);

    const expectedHighPriorityCount = 2;
    expect(result.summary.highPriorityCount).toBe(expectedHighPriorityCount);
  });
});