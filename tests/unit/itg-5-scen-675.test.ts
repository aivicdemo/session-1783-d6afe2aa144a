import { aggregateRejectionReasonsByCategory } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-675
  test("失敗パターン集計機能 - 献立却下修正の理由カテゴリ別に件数・発生率を正確に集計できる", () => {
    // テストデータ: 複数の献立却下修正レコード
    const rejectionRecords = [
      {
        id: "reject_001",
        category: "栄養不足",
        timestamp: new Date("2024-01-15T10:00:00Z"),
      },
      {
        id: "reject_002",
        category: "栄養不足",
        timestamp: new Date("2024-01-15T11:00:00Z"),
      },
      {
        id: "reject_003",
        category: "栄養不足",
        timestamp: new Date("2024-01-15T12:00:00Z"),
      },
      {
        id: "reject_004",
        category: "アレルギー対応",
        timestamp: new Date("2024-01-15T13:00:00Z"),
      },
      {
        id: "reject_005",
        category: "アレルギー対応",
        timestamp: new Date("2024-01-15T14:00:00Z"),
      },
      {
        id: "reject_006",
        category: "コスト超過",
        timestamp: new Date("2024-01-15T15:00:00Z"),
      },
      {
        id: "reject_007",
        category: "調理時間超過",
        timestamp: new Date("2024-01-15T16:00:00Z"),
      },
      {
        id: "reject_008",
        category: "調理時間超過",
        timestamp: new Date("2024-01-15T17:00:00Z"),
      },
    ];

    const result = aggregateRejectionReasonsByCategory(rejectionRecords);

    // 各カテゴリ別の件数が正確に計算されていることを確認
    expect(result.categoryBreakdown).toEqual(
      expect.objectContaining({
        栄養不足: expect.objectContaining({ count: 3 }),
        アレルギー対応: expect.objectContaining({ count: 2 }),
        コスト超過: expect.objectContaining({ count: 1 }),
        調理時間超過: expect.objectContaining({ count: 2 }),
      })
    );

    // 全体の却下件数に対する各カテゴリの発生率（パーセンテージ）が正確に計算されていることを確認
    // 総件数: 8件
    // 栄養不足: 3/8 = 37.5%
    // アレルギー対応: 2/8 = 25%
    // コスト超過: 1/8 = 12.5%
    // 調理時間超過: 2/8 = 25%
    expect(result.categoryBreakdown.栄養不足.percentage).toBe(37.5);
    expect(result.categoryBreakdown.アレルギー対応.percentage).toBe(25);
    expect(result.categoryBreakdown.コスト超過.percentage).toBe(12.5);
    expect(result.categoryBreakdown.調理時間超過.percentage).toBe(25);

    // 複数のカテゴリにおいて、件数と発生率の合算が総件数と100%に一致することを検証
    const totalCount = Object.values(result.categoryBreakdown).reduce(
      (sum, cat) => sum + cat.count,
      0
    );
    expect(totalCount).toBe(8);

    const totalPercentage = Object.values(result.categoryBreakdown).reduce(
      (sum, cat) => sum + cat.percentage,
      0
    );
    expect(totalPercentage).toBe(100);

    // 集計結果の総件数が正確に記録されていることを確認
    expect(result.totalRejectionCount).toBe(8);

    // 集計結果に全カテゴリが含まれていることを確認
    expect(Object.keys(result.categoryBreakdown)).toContain("栄養不足");
    expect(Object.keys(result.categoryBreakdown)).toContain("アレルギー対応");
    expect(Object.keys(result.categoryBreakdown)).toContain("コスト超過");
    expect(Object.keys(result.categoryBreakdown)).toContain("調理時間超過");

    // 各カテゴリが必要なプロパティを持つことを確認
    Object.values(result.categoryBreakdown).forEach((category) => {
      expect(category).toHaveProperty("count");
      expect(category).toHaveProperty("percentage");
      expect(typeof category.count).toBe("number");
      expect(typeof category.percentage).toBe("number");
    });

    // エラーケース: 空のレコード配列が渡された場合
    expect(() => {
      aggregateRejectionReasonsByCategory([]);
    }).toThrow(/却下記録/);

    // エラーケース: categoryフィールドが欠落したレコード
    expect(() => {
      aggregateRejectionReasonsByCategory([
        {
          id: "reject_invalid",
          timestamp: new Date("2024-01-15T10:00:00Z"),
        } as any,
      ]);
    }).toThrow(/カテゴリ/);

    // エラーケース: 不正なカテゴリ値
    expect(() => {
      aggregateRejectionReasonsByCategory([
        {
          id: "reject_invalid",
          category: "不正なカテゴリ",
          timestamp: new Date("2024-01-15T10:00:00Z"),
        },
      ]);
    }).toThrow(/カテゴリ/);
  });
});