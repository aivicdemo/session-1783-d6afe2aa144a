import { validateMealEvaluationInput, checkEvaluationDeadlineStatus } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("食事評価入力期限管理機能", () => {
  // SCEN-449
  test("入力期限超過後の家族成員の未入力評価が未入力扱いになる", () => {
    const baseDate = new Date("2024-01-15T00:00:00Z");
    const deadlineDate = new Date("2024-01-18T23:59:59Z");
    const afterDeadlineDate = new Date("2024-01-19T10:00:00Z");

    const mealId = "meal_001";
    const familyMemberAId = "member_a";
    const familyMemberBId = "member_b";
    const familyMemberCId = "member_c";

    const evaluationInputDeadlineConfig = {
      mealId: mealId,
      deadlineDate: deadlineDate.toISOString(),
      createdAt: baseDate.toISOString(),
    };

    const familyMembers = [
      {
        id: familyMemberAId,
        name: "Family Member A",
        ageGroup: "adult",
      },
      {
        id: familyMemberBId,
        name: "Family Member B",
        ageGroup: "child",
      },
      {
        id: familyMemberCId,
        name: "Family Member C",
        ageGroup: "child",
      },
    ];

    const evaluationInputRecords = [
      {
        memberId: familyMemberAId,
        mealId: mealId,
        satisfactionScore: 4,
        completionDegree: 95,
        requestText: "もっと塩辛い料理を希望します",
        inputTimestamp: new Date("2024-01-19T08:30:00Z").toISOString(),
      },
    ];

    const inputStatusResult = checkEvaluationDeadlineStatus({
      mealId: mealId,
      currentDate: afterDeadlineDate.toISOString(),
      deadline: deadlineDate.toISOString(),
      familyMembers: familyMembers,
      submittedEvaluations: evaluationInputRecords,
    });

    expect(inputStatusResult.mealId).toBe(mealId);
    expect(inputStatusResult.currentDate).toBe(afterDeadlineDate.toISOString());
    expect(inputStatusResult.isDeadlinePassed).toBe(true);
    expect(inputStatusResult.evaluationStatus).toHaveLength(3);

    const memberAStatus = inputStatusResult.evaluationStatus.find(
      (s: any) => s.memberId === familyMemberAId
    );
    expect(memberAStatus).toBeDefined();
    expect(memberAStatus.inputStatus).toBe("submitted");
    expect(memberAStatus.satisfactionScore).toBe(4);
    expect(memberAStatus.completionDegree).toBe(95);

    const memberBStatus = inputStatusResult.evaluationStatus.find(
      (s: any) => s.memberId === familyMemberBId
    );
    expect(memberBStatus).toBeDefined();
    expect(memberBStatus.inputStatus).toBe("not_submitted");
    expect(memberBStatus.satisfactionScore).toBeNull();
    expect(memberBStatus.completionDegree).toBeNull();

    const memberCStatus = inputStatusResult.evaluationStatus.find(
      (s: any) => s.memberId === familyMemberCId
    );
    expect(memberCStatus).toBeDefined();
    expect(memberCStatus.inputStatus).toBe("not_submitted");
    expect(memberCStatus.satisfactionScore).toBeNull();
    expect(memberCStatus.completionDegree).toBeNull();

    const notSubmittedMembers = inputStatusResult.evaluationStatus.filter(
      (s: any) => s.inputStatus === "not_submitted"
    );
    expect(notSubmittedMembers).toHaveLength(2);
    expect(notSubmittedMembers.map((s: any) => s.memberId)).toEqual([
      familyMemberBId,
      familyMemberCId,
    ]);

    const validationInputA = {
      satisfactionScore: 4,
      completionDegree: 95,
      requestText: "もっと塩辛い料理を希望します",
    };
    const validationResultA = validateMealEvaluationInput(validationInputA);
    expect(validationResultA.isValid).toBe(true);
    expect(validationResultA.errors).toHaveLength(0);

    const validationInputInvalid = {
      satisfactionScore: 6,
      completionDegree: 95,
      requestText: "test",
    };
    expect(() =>
      validateMealEvaluationInput(validationInputInvalid)
    ).toThrow(/満足度/);
  });
});