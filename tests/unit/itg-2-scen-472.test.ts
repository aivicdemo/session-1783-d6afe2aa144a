import { evaluateNutritionLogic } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養基準ロジック評価機能 - 達成度スコア判定", () => {
  test("SCEN-472: 達成度スコア50%未満の項目に対して不合格判定が正しく下される", () => {
    // テストデータ: 達成度スコア50%未満の栄養項目を含む
    const nutritionData = [
      {
        nutrient_id: 1,
        nutrient_name: "タンパク質",
        target_value: 100,
        actual_value: 45,
        achievement_rate: 45,
      },
      {
        nutrient_id: 2,
        nutrient_name: "カルシウム",
        target_value: 1000,
        actual_value: 300,
        achievement_rate: 30,
      },
      {
        nutrient_id: 3,
        nutrient_name: "ビタミンC",
        target_value: 100,
        actual_value: 50,
        achievement_rate: 50,
      },
      {
        nutrient_id: 4,
        nutrient_name: "鉄分",
        target_value: 18,
        actual_value: 15,
        achievement_rate: 83,
      },
    ];

    // 評価処理を実行
    const evaluationResult = evaluateNutritionLogic(nutritionData);

    // 達成度スコア50%未満の項目が不合格と判定されていることを検証
    expect(evaluationResult.items).toHaveLength(4);

    // タンパク質（45%）は不合格
    expect(evaluationResult.items[0]).toEqual({
      nutrient_id: 1,
      nutrient_name: "タンパク質",
      achievement_rate: 45,
      is_passed: false,
      judgement: "不合格",
      priority_rank: 1,
    });

    // カルシウム（30%）は不合格
    expect(evaluationResult.items[1]).toEqual({
      nutrient_id: 2,
      nutrient_name: "カルシウム",
      achievement_rate: 30,
      is_passed: false,
      judgement: "不合格",
      priority_rank: 2,
    });

    // ビタミンC（50%）は合格（境界値50%はちょうど）
    expect(evaluationResult.items[2]).toEqual({
      nutrient_id: 3,
      nutrient_name: "ビタミンC",
      achievement_rate: 50,
      is_passed: true,
      judgement: "合格",
      priority_rank: 0,
    });

    // 鉄分（83%）は合格
    expect(evaluationResult.items[3]).toEqual({
      nutrient_id: 4,
      nutrient_name: "鉄分",
      achievement_rate: 83,
      is_passed: true,
      judgement: "合格",
      priority_rank: 0,
    });

    // 全体的な評価結果を検証
    expect(evaluationResult.overall_judgement).toBe("不合格");
    expect(evaluationResult.failed_count).toBe(2);
    expect(evaluationResult.passed_count).toBe(2);
    expect(evaluationResult.failure_rate).toBe(50);

    // 不合格項目が改善ギャップ計算時に優先度付けされていることを検証
    const failedItems = evaluationResult.items.filter(
      (item) => item.is_passed === false
    );
    expect(failedItems).toHaveLength(2);
    expect(failedItems[0].priority_rank).toBe(1); // カルシウム（30%）が最優先
    expect(failedItems[1].priority_rank).toBe(2); // タンパク質（45%）が次優先

    // 改善ギャップを検証
    expect(evaluationResult.items[0].improvement_gap).toBe(55);
    expect(evaluationResult.items[1].improvement_gap).toBe(70);
  });

  test("SCEN-472: 境界値50%ちょうどの場合は合格と判定される", () => {
    const nutritionDataBoundary = [
      {
        nutrient_id: 1,
        nutrient_name: "タンパク質",
        target_value: 100,
        actual_value: 50,
        achievement_rate: 50,
      },
      {
        nutrient_id: 2,
        nutrient_name: "カルシウム",
        target_value: 1000,
        actual_value: 499,
        achievement_rate: 49.9,
      },
    ];

    const evaluationResult = evaluateNutritionLogic(nutritionDataBoundary);

    // 50%ちょうどは合格
    expect(evaluationResult.items[0]).toEqual({
      nutrient_id: 1,
      nutrient_name: "タンパク質",
      achievement_rate: 50,
      is_passed: true,
      judgement: "合格",
      priority_rank: 0,
    });

    // 49.9%は不合格
    expect(evaluationResult.items[1].is_passed).toBe(false);
    expect(evaluationResult.items[1].judgement).toBe("不合格");
  });

  test("SCEN-472: 全項目が50%未満の場合、複数不合格判定と優先度ランキングが正しく生成される", () => {
    const allFailingData = [
      {
        nutrient_id: 1,
        nutrient_name: "タンパク質",
        target_value: 100,
        actual_value: 20,
        achievement_rate: 20,
      },
      {
        nutrient_id: 2,
        nutrient_name: "カルシウム",
        target_value: 1000,
        actual_value: 100,
        achievement_rate: 10,
      },
      {
        nutrient_id: 3,
        nutrient_name: "ビタミンA",
        target_value: 800,
        actual_value: 200,
        achievement_rate: 25,
      },
    ];

    const evaluationResult = evaluateNutritionLogic(allFailingData);

    // すべてが不合格
    expect(evaluationResult.overall_judgement).toBe("不合格");
    expect(evaluationResult.failed_count).toBe(3);
    expect(evaluationResult.passed_count).toBe(0);
    expect(evaluationResult.failure_rate).toBe(100);

    // 優先度はスコアが低いほど（改善ギャップが大きいほど）高い
    expect(evaluationResult.items[1].priority_rank).toBe(1); // カルシウム（10%）が最優先
    expect(evaluationResult.items[2].priority_rank).toBe(2); // ビタミンA（25%）
    expect(evaluationResult.items[0].priority_rank).toBe(3); // タンパク質（20%）
  });

  test("SCEN-472: 空配列またはデータなしの場合のエラーハンドリング", () => {
    expect(() => evaluateNutritionLogic([])).toThrow(/栄養データ/);
  });

  test("SCEN-472: 不正な達成度スコア（負数または100超）の場合のエラーハンドリング", () => {
    const invalidData = [
      {
        nutrient_id: 1,
        nutrient_name: "タンパク質",
        target_value: 100,
        actual_value: -10,
        achievement_rate: -10,
      },
    ];

    expect(() => evaluateNutritionLogic(invalidData)).toThrow(/達成度/);
  });
});