import { detectPriorityConflict } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-484: [error] 複数制限条件の優先度処理と自動決定 - 制限条件の優先度決定に失敗した場合、エラーを発生させる
  test("複数の制限条件に同じ優先度が割り当てられた場合、優先度競合エラーをスロー", () => {
    const restrictionConditions = [
      {
        id: "allergy_001",
        type: "アレルギー",
        name: "卵アレルギー",
        priority: 1,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      },
      {
        id: "calorie_001",
        type: "カロリー制限",
        name: "1800kcal以下",
        priority: 1,
        createdAt: new Date("2024-01-15T11:05:00Z"),
      },
      {
        id: "cooking_time_001",
        type: "調理時間制限",
        name: "30分以内",
        priority: 1,
        createdAt: new Date("2024-01-15T11:10:00Z"),
      },
    ];

    expect(() => {
      detectPriorityConflict(restrictionConditions);
    }).toThrow(/優先度/);
  });

  test("制限条件に優先度が定義されていない場合、優先度未定義エラーをスロー", () => {
    const restrictionConditions = [
      {
        id: "allergy_001",
        type: "アレルギー",
        name: "卵アレルギー",
        priority: undefined,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      },
      {
        id: "calorie_001",
        type: "カロリー制限",
        name: "1800kcal以下",
        priority: 2,
        createdAt: new Date("2024-01-15T11:05:00Z"),
      },
    ];

    expect(() => {
      detectPriorityConflict(restrictionConditions);
    }).toThrow(/優先度/);
  });

  test("複数の制限条件が異なる優先度を持つ場合、成功して優先度順序を返す", () => {
    const restrictionConditions = [
      {
        id: "allergy_001",
        type: "アレルギー",
        name: "卵アレルギー",
        priority: 1,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      },
      {
        id: "calorie_001",
        type: "カロリー制限",
        name: "1800kcal以下",
        priority: 2,
        createdAt: new Date("2024-01-15T11:05:00Z"),
      },
      {
        id: "cooking_time_001",
        type: "調理時間制限",
        name: "30分以内",
        priority: 3,
        createdAt: new Date("2024-01-15T11:10:00Z"),
      },
    ];

    const result = detectPriorityConflict(restrictionConditions);

    expect(result).toEqual({
      hasConflict: false,
      priorityOrder: [
        {
          id: "allergy_001",
          type: "アレルギー",
          name: "卵アレルギー",
          priority: 1,
          createdAt: new Date("2024-01-15T11:00:00Z"),
        },
        {
          id: "calorie_001",
          type: "カロリー制限",
          name: "1800kcal以下",
          priority: 2,
          createdAt: new Date("2024-01-15T11:05:00Z"),
        },
        {
          id: "cooking_time_001",
          type: "調理時間制限",
          name: "30分以内",
          priority: 3,
          createdAt: new Date("2024-01-15T11:10:00Z"),
        },
      ],
    });
  });

  test("制限条件が空配列の場合、エラーをスロー", () => {
    const restrictionConditions: any[] = [];

    expect(() => {
      detectPriorityConflict(restrictionConditions);
    }).toThrow(/優先度/);
  });

  test("2つ以上の制限条件が同じ優先度を持つ場合、優先度競合エラーをスロー", () => {
    const restrictionConditions = [
      {
        id: "allergy_001",
        type: "アレルギー",
        name: "卵アレルギー",
        priority: 1,
        createdAt: new Date("2024-01-15T11:00:00Z"),
      },
      {
        id: "allergy_002",
        type: "アレルギー",
        name: "乳製品アレルギー",
        priority: 1,
        createdAt: new Date("2024-01-15T11:05:00Z"),
      },
      {
        id: "calorie_001",
        type: "カロリー制限",
        name: "1800kcal以下",
        priority: 2,
        createdAt: new Date("2024-01-15T11:10:00Z"),
      },
    ];

    expect(() => {
      detectPriorityConflict(restrictionConditions);
    }).toThrow(/優先度/);
  });
});