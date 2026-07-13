import { calculateNutritionPriority } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養項目優先度判定 - 栄養項目データが空の場合のエラーハンドリング", () => {
  // SCEN-486
  test("栄養項目データが空（null）の場合、適切なエラーハンドリングが実行される", () => {
    const emptyNutritionData = null;

    expect(() => calculateNutritionPriority(emptyNutritionData)).toThrow(
      /栄養項目/
    );
  });

  test("栄養項目データが空（undefined）の場合、適切なエラーハンドリングが実行される", () => {
    const emptyNutritionData = undefined;

    expect(() => calculateNutritionPriority(emptyNutritionData)).toThrow(
      /栄養項目/
    );
  });

  test("栄養項目データが空配列の場合、適切なエラーハンドリングが実行される", () => {
    const emptyNutritionData: Array<{
      item_id: string;
      target_value: number;
      actual_value: number;
    }> = [];

    expect(() => calculateNutritionPriority(emptyNutritionData)).toThrow(
      /栄養項目/
    );
  });

  test("正常な栄養項目データが提供される場合、優先度判定結果が正しく計算される", () => {
    const validNutritionData = [
      {
        item_id: "protein",
        target_value: 100,
        actual_value: 60,
      },
      {
        item_id: "calcium",
        target_value: 800,
        actual_value: 400,
      },
      {
        item_id: "iron",
        target_value: 15,
        actual_value: 10,
      },
    ];

    const result = calculateNutritionPriority(validNutritionData);

    expect(result).toEqual(
      expect.objectContaining({
        priorities: expect.arrayContaining([
          expect.objectContaining({
            item_id: expect.any(String),
            achievement_rate: expect.any(Number),
            gap: expect.any(Number),
            priority_rank: expect.any(Number),
          }),
        ]),
        total_items: 3,
        critical_items_count: expect.any(Number),
      })
    );

    expect(result.total_items).toBe(3);
    expect(result.priorities.length).toBe(3);

    const proteinPriority = result.priorities.find(
      (p) => p.item_id === "protein"
    );
    expect(proteinPriority).toBeDefined();
    expect(proteinPriority?.achievement_rate).toBe(60);
    expect(proteinPriority?.gap).toBe(40);

    const calciumPriority = result.priorities.find(
      (p) => p.item_id === "calcium"
    );
    expect(calciumPriority).toBeDefined();
    expect(calciumPriority?.achievement_rate).toBe(50);
    expect(calciumPriority?.gap).toBe(400);

    expect(result.priorities[0].priority_rank).toBeLessThan(
      result.priorities[1].priority_rank
    );
  });
});