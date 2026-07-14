import { aggregateMealFeedback } from "../../src/logic/it-7-2-1";

describe("献立評価フィードバック蓄積機能", () => {
  // SCEN-544
  test("週次献立実行後に満足度・完食度・リクエストを構造化データとして蓄積する", () => {
    const feedbackData = [
      {
        date: "2024-01-08",
        satisfaction: 5,
        completionRate: 95,
        request: "もっと野菜を増やしてほしい",
      },
      {
        date: "2024-01-09",
        satisfaction: 4,
        completionRate: 88,
        request: "子どもが好きなメニューを増やしてほしい",
      },
      {
        date: "2024-01-10",
        satisfaction: 3,
        completionRate: 70,
        request: "調理時間を短縮したいメニューを提案してほしい",
      },
      {
        date: "2024-01-11",
        satisfaction: 5,
        completionRate: 100,
        request: "このメニューはまた作ってほしい",
      },
      {
        date: "2024-01-12",
        satisfaction: 2,
        completionRate: 45,
        request: "味が濃すぎた",
      },
      {
        date: "2024-01-13",
        satisfaction: 4,
        completionRate: 92,
        request: "食材の品質が良かった",
      },
      {
        date: "2024-01-14",
        satisfaction: 5,
        completionRate: 100,
        request: "栄養バランスが良かった",
      },
    ];

    const result = aggregateMealFeedback(feedbackData);

    // スキーマ検証：必須フィールドの存在確認
    expect(result).toHaveProperty("aggregatedData");
    expect(Array.isArray(result.aggregatedData)).toBe(true);

    // 蓄積されたデータの件数が7件であることを確認
    expect(result.aggregatedData.length).toBe(7);

    // 各日付のデータが正しい構造化形式で格納されていることを確認
    result.aggregatedData.forEach((item: any, index: number) => {
      expect(item).toHaveProperty("date");
      expect(item).toHaveProperty("satisfaction");
      expect(item).toHaveProperty("completionRate");
      expect(item).toHaveProperty("request");

      // 蓄積データにおいて、満足度が数値型であることを検証
      expect(typeof item.satisfaction).toBe("number");
      expect(item.satisfaction).toBeGreaterThanOrEqual(1);
      expect(item.satisfaction).toBeLessThanOrEqual(5);

      // 蓄積データにおいて、完食度が0-100の数値型であることを検証
      expect(typeof item.completionRate).toBe("number");
      expect(item.completionRate).toBeGreaterThanOrEqual(0);
      expect(item.completionRate).toBeLessThanOrEqual(100);

      // 蓄積データにおいて、リクエストが文字列型であることを検証
      expect(typeof item.request).toBe("string");
      expect(item.request.length).toBeGreaterThan(0);

      // 日付フォーマット検証
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.date).toBe(feedbackData[index].date);
    });

    // データベースまたはストレージにデータが永続化されていることを確認
    expect(result).toHaveProperty("persistenceStatus");
    expect(result.persistenceStatus).toBe("persisted");

    // 集計データの統計情報検証
    expect(result).toHaveProperty("statistics");
    expect(result.statistics.averageSatisfaction).toBe(
      (5 + 4 + 3 + 5 + 2 + 4 + 5) / 7
    );
    expect(result.statistics.averageCompletionRate).toBe(
      (95 + 88 + 70 + 100 + 45 + 92 + 100) / 7
    );
    expect(result.statistics.totalRecords).toBe(7);
  });
});