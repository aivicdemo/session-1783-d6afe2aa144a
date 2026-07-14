import { classifyAndAggregateRejectionReasons } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-768: [normal] 失敗パターン自動カテゴリ分類機能 - 複数の却下・修正理由が統計集計され、パターン頻度が算出される
  test("複数の却下・修正理由が正しくカテゴリ分類され、統計集計と頻度算出が正確に実行される", () => {
    // Arrange: テストデータの準備 - 複数の却下・修正理由データ（5件以上）
    const rejectionReasonsInput = [
      {
        rejection_reason_id: 1,
        reason_text: "栄養バランスが偏っている",
        timestamp: "2024-01-15T10:00:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 2,
        reason_text: "栄養素が不足している",
        timestamp: "2024-01-15T10:05:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 3,
        reason_text: "家族の好みに合わない",
        timestamp: "2024-01-15T10:10:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 4,
        reason_text: "調理時間が長すぎる",
        timestamp: "2024-01-15T10:15:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 5,
        reason_text: "栄養バランスが崩れている",
        timestamp: "2024-01-15T10:20:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 6,
        reason_text: "好みと異なる献立",
        timestamp: "2024-01-15T10:25:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 7,
        reason_text: "調理時間が超過している",
        timestamp: "2024-01-15T10:30:00Z",
        user_id: "user_001",
      },
      {
        rejection_reason_id: 8,
        reason_text: "予算を超えている",
        timestamp: "2024-01-15T10:35:00Z",
        user_id: "user_001",
      },
    ];

    // Act: 失敗パターン自動カテゴリ分類機能を実行
    const result = classifyAndAggregateRejectionReasons(
      rejectionReasonsInput
    );

    // Assert: 分類結果の検証
    // 1. カテゴリ分類が正確に実行されているか確認
    expect(result).toBeDefined();
    expect(result.classified_data).toBeDefined();
    expect(Array.isArray(result.classified_data)).toBe(true);
    expect(result.classified_data.length).toBe(8);

    // 2. 各却下・修正理由が適切なカテゴリに分類されているか確認
    const categorizedItems = result.classified_data;

    // 栄養バランス関連（ID 1, 2, 5）
    expect(categorizedItems[0]).toMatchObject({
      rejection_reason_id: 1,
      category: "栄養",
    });
    expect(categorizedItems[1]).toMatchObject({
      rejection_reason_id: 2,
      category: "栄養",
    });
    expect(categorizedItems[4]).toMatchObject({
      rejection_reason_id: 5,
      category: "栄養",
    });

    // 好み関連（ID 3, 6）
    expect(categorizedItems[2]).toMatchObject({
      rejection_reason_id: 3,
      category: "好み",
    });
    expect(categorizedItems[5]).toMatchObject({
      rejection_reason_id: 6,
      category: "好み",
    });

    // 調理時間関連（ID 4, 7）
    expect(categorizedItems[3]).toMatchObject({
      rejection_reason_id: 4,
      category: "調理時間",
    });
    expect(categorizedItems[6]).toMatchObject({
      rejection_reason_id: 7,
      category: "調理時間",
    });

    // 予算関連（ID 8）
    expect(categorizedItems[7]).toMatchObject({
      rejection_reason_id: 8,
      category: "予算",
    });

    // 3. 統計集計結果の検証 - カテゴリごとの件数が正確に算出されているか
    expect(result.statistics).toBeDefined();
    expect(result.statistics.total_count).toBe(8);

    // 4. カテゴリ別集計データの確認
    const stats = result.statistics.category_statistics;
    expect(stats).toBeDefined();
    expect(Array.isArray(stats)).toBe(true);

    // カテゴリ別の件数確認
    const nutritionStats = stats.find((s) => s.category === "栄養");
    expect(nutritionStats).toBeDefined();
    expect(nutritionStats?.count).toBe(3);

    const preferenceStats = stats.find((s) => s.category === "好み");
    expect(preferenceStats).toBeDefined();
    expect(preferenceStats?.count).toBe(2);

    const cookingTimeStats = stats.find((s) => s.category === "調理時間");
    expect(cookingTimeStats).toBeDefined();
    expect(cookingTimeStats?.count).toBe(2);

    const budgetStats = stats.find((s) => s.category === "予算");
    expect(budgetStats).toBeDefined();
    expect(budgetStats?.count).toBe(1);

    // 5. パターン頻度の正確性検証 - パーセンテージが正確に計算されているか
    // 栄養: 3/8 = 37.5%
    expect(nutritionStats?.frequency_percentage).toBe(37.5);

    // 好み: 2/8 = 25%
    expect(preferenceStats?.frequency_percentage).toBe(25);

    // 調理時間: 2/8 = 25%
    expect(cookingTimeStats?.frequency_percentage).toBe(25);

    // 予算: 1/8 = 12.5%
    expect(budgetStats?.frequency_percentage).toBe(12.5);

    // 6. ソート順序の検証 - 頻度の高い順にソートされているか
    expect(stats[0].category).toBe("栄養");
    expect(stats[0].frequency_percentage).toBe(37.5);
    expect(stats[1].category).toBe("好み");
    expect(stats[1].frequency_percentage).toBe(25);
    expect(stats[2].category).toBe("調理時間");
    expect(stats[2].frequency_percentage).toBe(25);
    expect(stats[3].category).toBe("予算");
    expect(stats[3].frequency_percentage).toBe(12.5);

    // 7. 可視化データ（グラフ・チャート用）の生成確認
    expect(result.visualization_data).toBeDefined();
    expect(result.visualization_data.chart_type).toBe("bar");
    expect(result.visualization_data.labels).toEqual([
      "栄養",
      "好み",
      "調理時間",
      "予算",
    ]);
    expect(result.visualization_data.values).toEqual([37.5, 25, 25, 12.5]);
    expect(result.visualization_data.counts).toEqual([3, 2, 2, 1]);

    // 8. メタデータの確認
    expect(result.metadata).toBeDefined();
    expect(result.metadata.aggregation_timestamp).toBeDefined();
    expect(result.metadata.data_range_start).toBe("2024-01-15T10:00:00Z");
    expect(result.metadata.data_range_end).toBe("2024-01-15T10:35:00Z");
    expect(result.metadata.user_id).toBe("user_001");
  });
});