import { detectAndPrioritizeDietaryRestrictionChanges } from "../../src/logic/it-1-1-1";

describe("食事制限・アレルギー情報の変更検出と優先度付け", () => {
  // SCEN-335
  test("不正な形式の食事制限情報が入力された場合エラーが返される", () => {
    const invalidRestrictionPatterns = [
      {
        restrictionCode: "!!!###$$$",
        description: "特殊文字のみの入力",
      },
      {
        restrictionCode: "12345",
        description: "数字のみの入力",
      },
      {
        restrictionCode: "UNDEFINED_CODE_XYZ",
        description: "定義されていないコード",
      },
      {
        restrictionCode: "",
        description: "空文字列",
      },
      {
        restrictionCode: "   ",
        description: "スペースのみ",
      },
    ];

    invalidRestrictionPatterns.forEach(({ restrictionCode, description }) => {
      expect(() =>
        detectAndPrioritizeDietaryRestrictionChanges({
          userId: "user_123",
          familyMemberId: "member_456",
          restrictions: [
            {
              restrictionCode,
              restrictionName: "Test Restriction",
              severity: 1,
              createdAt: new Date("2024-01-15T10:00:00Z"),
            },
          ],
          previousRestrictions: [],
          timestamp: new Date("2024-01-15T11:00:00Z"),
        })
      ).toThrow(/入力形式/);
    });
  });

  test("定義済みの食事制限コードが正常に検出・優先度付けされる", () => {
    const result = detectAndPrioritizeDietaryRestrictionChanges({
      userId: "user_123",
      familyMemberId: "member_456",
      restrictions: [
        {
          restrictionCode: "GLUTEN_FREE",
          restrictionName: "Gluten-free",
          severity: 2,
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
        {
          restrictionCode: "DAIRY_FREE",
          restrictionName: "Dairy-free",
          severity: 1,
          createdAt: new Date("2024-01-15T10:05:00Z"),
        },
      ],
      previousRestrictions: [],
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    expect(result).toEqual(
      expect.objectContaining({
        detectedChanges: expect.arrayContaining([
          expect.objectContaining({
            restrictionCode: "GLUTEN_FREE",
            priority: 1,
            changeType: "added",
          }),
          expect.objectContaining({
            restrictionCode: "DAIRY_FREE",
            priority: 2,
            changeType: "added",
          }),
        ]),
        totalChanges: 2,
        requiresImmediateReflection: true,
      })
    );
  });

  test("既存制限からの削除が正常に検出される", () => {
    const result = detectAndPrioritizeDietaryRestrictionChanges({
      userId: "user_123",
      familyMemberId: "member_456",
      restrictions: [],
      previousRestrictions: [
        {
          restrictionCode: "GLUTEN_FREE",
          restrictionName: "Gluten-free",
          severity: 2,
          createdAt: new Date("2024-01-10T10:00:00Z"),
        },
      ],
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    expect(result).toEqual(
      expect.objectContaining({
        detectedChanges: expect.arrayContaining([
          expect.objectContaining({
            restrictionCode: "GLUTEN_FREE",
            changeType: "removed",
          }),
        ]),
        totalChanges: 1,
      })
    );
  });

  test("制限情報の重複入力がフィルタリングされる", () => {
    expect(() =>
      detectAndPrioritizeDietaryRestrictionChanges({
        userId: "user_123",
        familyMemberId: "member_456",
        restrictions: [
          {
            restrictionCode: "GLUTEN_FREE",
            restrictionName: "Gluten-free",
            severity: 2,
            createdAt: new Date("2024-01-15T10:00:00Z"),
          },
          {
            restrictionCode: "GLUTEN_FREE",
            restrictionName: "Gluten-free",
            severity: 2,
            createdAt: new Date("2024-01-15T10:01:00Z"),
          },
        ],
        previousRestrictions: [],
        timestamp: new Date("2024-01-15T11:00:00Z"),
      })
    ).toThrow(/重複/);
  });

  test("食事制限コードが正しくない場合エラーが返される", () => {
    expect(() =>
      detectAndPrioritizeDietaryRestrictionChanges({
        userId: "user_123",
        familyMemberId: "member_456",
        restrictions: [
          {
            restrictionCode: "INVALID_CODE",
            restrictionName: "Invalid",
            severity: 1,
            createdAt: new Date("2024-01-15T10:00:00Z"),
          },
        ],
        previousRestrictions: [],
        timestamp: new Date("2024-01-15T11:00:00Z"),
      })
    ).toThrow(/食事制限情報/);
  });

  test("前回更新から7日以上経過している場合、変更検知フラグが立つ", () => {
    const result = detectAndPrioritizeDietaryRestrictionChanges({
      userId: "user_123",
      familyMemberId: "member_456",
      restrictions: [
        {
          restrictionCode: "VEGETARIAN",
          restrictionName: "Vegetarian",
          severity: 1,
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
      ],
      previousRestrictions: [
        {
          restrictionCode: "GLUTEN_FREE",
          restrictionName: "Gluten-free",
          severity: 2,
          createdAt: new Date("2024-01-01T10:00:00Z"),
        },
      ],
      timestamp: new Date("2024-01-22T11:00:00Z"),
    });

    expect(result).toEqual(
      expect.objectContaining({
        daysSinceLastUpdate: 21,
        requiresImmediateReflection: true,
      })
    );
  });

  test("複数の制限条件が入力された場合、優先度順に並べられる", () => {
    const result = detectAndPrioritizeDietaryRestrictionChanges({
      userId: "user_123",
      familyMemberId: "member_456",
      restrictions: [
        {
          restrictionCode: "DAIRY_FREE",
          restrictionName: "Dairy-free",
          severity: 1,
          createdAt: new Date("2024-01-15T10:00:00Z"),
        },
        {
          restrictionCode: "NUT_ALLERGY",
          restrictionName: "Nut allergy",
          severity: 3,
          createdAt: new Date("2024-01-15T10:05:00Z"),
        },
        {
          restrictionCode: "GLUTEN_FREE",
          restrictionName: "Gluten-free",
          severity: 2,
          createdAt: new Date("2024-01-15T10:10:00Z"),
        },
      ],
      previousRestrictions: [],
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    expect(result.detectedChanges[0].priority).toBe(1);
    expect(result.detectedChanges[1].priority).toBe(2);
    expect(result.detectedChanges[2].priority).toBe(3);
    expect(result.detectedChanges.length).toBe(3);
  });

  test("ユーザーIDが不正な場合エラーが返される", () => {
    expect(() =>
      detectAndPrioritizeDietaryRestrictionChanges({
        userId: "",
        familyMemberId: "member_456",
        restrictions: [
          {
            restrictionCode: "GLUTEN_FREE",
            restrictionName: "Gluten-free",
            severity: 2,
            createdAt: new Date("2024-01-15T10:00:00Z"),
          },
        ],
        previousRestrictions: [],
        timestamp: new Date("2024-01-15T11:00:00Z"),
      })
    ).toThrow(/ユーザーID/);
  });

  test("タイムスタンプが無効な場合エラーが返される", () => {
    expect(() =>
      detectAndPrioritizeDietaryRestrictionChanges({
        userId: "user_123",
        familyMemberId: "member_456",
        restrictions: [
          {
            restrictionCode: "GLUTEN_FREE",
            restrictionName: "Gluten-free",
            severity: 2,
            createdAt: new Date("2024-01-15T10:00:00Z"),
          },
        ],
        previousRestrictions: [],
        timestamp: new Date("invalid"),
      })
    ).toThrow(/タイムスタンプ/);
  });

  test("制限情報がない場合は空の結果が返される", () => {
    const result = detectAndPrioritizeDietaryRestrictionChanges({
      userId: "user_123",
      familyMemberId: "member_456",
      restrictions: [],
      previousRestrictions: [],
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });

    expect(result).toEqual(
      expect.objectContaining({
        detectedChanges: [],
        totalChanges: 0,
        requiresImmediateReflection: false,
      })
    );
  });

  test("severity値が範囲外の場合エラーが返される", () => {
    expect(() =>
      detectAndPrioritizeDietaryRestrictionChanges({
        userId: "user_123",
        familyMemberId: "member_456",
        restrictions: [
          {
            restrictionCode: "GLUTEN_FREE",
            restrictionName: "Gluten-free",
            severity: 5,
            createdAt: new Date("2024-01-15T10:00:00Z"),
          },
        ],
        previousRestrictions: [],
        timestamp: new Date("2024-01-15T11:00:00Z"),
      })
    ).toThrow(/severity/);
  });
});