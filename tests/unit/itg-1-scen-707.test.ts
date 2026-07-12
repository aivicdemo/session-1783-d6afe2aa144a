import { detectAnomaliesWithFallback } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-707
  test("外れ値検出・品質検証機能 - 利用ログが欠落している場合にエラーで処理が中断される", () => {
    const missingLogInput = {
      utilizationLogs: [] as Array<{
        userId: string;
        mealId: string;
        satisfactionScore: number;
        completionRate: number;
        requestText: string;
        timestamp: string;
      }>,
      mealCandidates: [
        {
          mealId: "meal-001",
          dishName: "ハンバーグ",
          prepTime: 45,
          nutritionScore: 85,
        },
      ],
      qualityThreshold: 0.7,
    };

    expect(() =>
      detectAnomaliesWithFallback(missingLogInput)
    ).toThrow(/利用ログ/);
  });
});