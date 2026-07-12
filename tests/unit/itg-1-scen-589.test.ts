import { classifyMenuGenerationFailures, rankFailuresByPriority } from "../../src/logic/it-1-br-4-2-1";

describe("失敗パターン分類・優先度判定機能", () => {
  // SCEN-589
  test("複数の失敗カテゴリが正しく分類され、発生頻度に基づいて改善優先度が決定される", () => {
    // 過去30日間の献立生成ログから抽出された複数の失敗事例
    const failureLogs = [
      {
        logId: "log_001",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        reasonText: "タンパク質の栄養価が基準値を下回る計算エラーが発生した",
        menuId: "menu_101",
      },
      {
        logId: "log_002",
        timestamp: new Date("2024-01-15T11:30:00Z"),
        reasonText: "冷蔵庫の鶏肉在庫が不足しており生成できない",
        menuId: "menu_102",
      },
      {
        logId: "log_003",
        timestamp: new Date("2024-01-16T09:00:00Z"),
        reasonText: "栄養価計算エラーにより献立生成が失敗した",
        menuId: "menu_103",
      },
      {
        logId: "log_004",
        timestamp: new Date("2024-01-16T14:20:00Z"),
        reasonText: "調理時間が1時間を超過してしまう献立になった",
        menuId: "menu_104",
      },
      {
        logId: "log_005",
        timestamp: new Date("2024-01-17T08:15:00Z"),
        reasonText: "調理時間制限を超えている料理が含まれている",
        menuId: "menu_105",
      },
      {
        logId: "log_006",
        timestamp: new Date("2024-01-17T16:45:00Z"),
        reasonText: "食材の在庫不足により生成不可",
        menuId: "menu_106",
      },
    ];

    // ステップ1: 失敗分類機能を実行
    const classificationResult = classifyMenuGenerationFailures(failureLogs);

    // ステップ2: 各失敗がカテゴリ別に分類されていることを検証
    expect(classificationResult).toHaveProperty("classified");
    expect(Array.isArray(classificationResult.classified)).toBe(true);

    // 分類結果から各カテゴリをマップ
    const categoryMap: Record<string, number> = {};
    classificationResult.classified.forEach(
      (item: { logId: string; category: string; reasonText: string }) => {
        if (!categoryMap[item.category]) {
          categoryMap[item.category] = 0;
        }
        categoryMap[item.category]++;
      }
    );

    // ステップ3: 最低3カテゴリ以上が抽出されたことを検証
    const categoryCount = Object.keys(categoryMap).length;
    expect(categoryCount).toBeGreaterThanOrEqual(3);

    // ステップ4: 各カテゴリの発生頻度を確認
    // 期待: 栄養価エラー 2件、在庫不足 2件、調理時間超過 2件
    expect(categoryMap["nutritionCalculationError"] || 0).toBe(2);
    expect(categoryMap["insufficientInventory"] || 0).toBe(2);
    expect(categoryMap["cookingTimeExceeded"] || 0).toBe(2);

    // ステップ5: 優先度判定機能を実行
    const priorityResult = rankFailuresByPriority(classificationResult.classified);

    // ステップ6: 優先度判定結果が発生頻度の降順で整列されていることを検証
    expect(priorityResult).toHaveProperty("rankedFailures");
    expect(Array.isArray(priorityResult.rankedFailures)).toBe(true);

    // ステップ7: 優先度ランキングが正しく付与されていることを検証
    // 各カテゴリが同じ頻度（2件ずつ）の場合、同一優先度またはランク内順序が安定していることを確認
    const rankedByCategory: Record<string, number[]> = {};
    priorityResult.rankedFailures.forEach(
      (item: {
        logId: string;
        category: string;
        priority: number;
        frequency: number;
      }) => {
        if (!rankedByCategory[item.category]) {
          rankedByCategory[item.category] = [];
        }
        rankedByCategory[item.category].push(item.priority);
      }
    );

    // 同じカテゴリ内のすべての優先度が一致していることを検証
    Object.values(rankedByCategory).forEach((priorities: number[]) => {
      const firstPriority = priorities[0];
      expect(priorities.every((p: number) => p === firstPriority)).toBe(true);
    });

    // ステップ8: 改善提案が優先度の高い順に出力されることを確認
    expect(priorityResult).toHaveProperty("improvementSuggestions");
    expect(Array.isArray(priorityResult.improvementSuggestions)).toBe(true);

    // 改善提案の並び順が優先度の降順（またはスコアの降順）であることを検証
    const suggestions = priorityResult.improvementSuggestions;
    for (let i = 0; i < suggestions.length - 1; i++) {
      expect(suggestions[i].priority).toBeLessThanOrEqual(
        suggestions[i + 1].priority
      );
    }

    // ステップ9: 総合的な検証
    // 改善提案の件数が3件以上（最低3カテゴリ以上）であることを確認
    expect(suggestions.length).toBeGreaterThanOrEqual(3);

    // 各改善提案に必須フィールドが含まれていることを検証
    suggestions.forEach(
      (suggestion: {
        category: string;
        frequency: number;
        priority: number;
        description: string;
      }) => {
        expect(suggestion).toHaveProperty("category");
        expect(suggestion).toHaveProperty("frequency");
        expect(suggestion).toHaveProperty("priority");
        expect(suggestion).toHaveProperty("description");
        expect(typeof suggestion.frequency).toBe("number");
        expect(typeof suggestion.priority).toBe("number");
        expect(suggestion.frequency).toBeGreaterThan(0);
      }
    );

    // 発生頻度とランキングが一致していることを最終検証
    // 最も頻度の高いカテゴリが最優先（最小のpriority値）であることを確認
    const maxFrequency = Math.max(
      ...suggestions.map((s: { frequency: number }) => s.frequency)
    );
    const highestPrioritySuggestion = suggestions.find(
      (s: { frequency: number; priority: number }) => s.frequency === maxFrequency
    );
    expect(highestPrioritySuggestion).toBeDefined();
    expect(highestPrioritySuggestion.priority).toBe(
      Math.min(...suggestions.map((s: { priority: number }) => s.priority))
    );
  });
});