import { classifyInterviewRecordsWithPriority } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("インタビュー内容自動分類機能", () => {
  // SCEN-646
  test("インタビュー記録がペイン要因カテゴリに自動分類され、優先度スコアが付与される", () => {
    const interview_records = [
      {
        id: "int_001",
        content:
          "毎週月曜日に献立を決めるのに3時間かかる。もっと早く決められたら嬉しい。",
        timestamp: "2024-01-15T10:30:00Z",
        user_id: "user_001",
      },
      {
        id: "int_002",
        content:
          "子どもがピーナッツアレルギーなので、毎回チェックが大変。アレルギー対応献立が自動で提案されたら助かる。",
        timestamp: "2024-01-15T11:00:00Z",
        user_id: "user_001",
      },
      {
        id: "int_003",
        content:
          "毎日の食費が月に3万円以上かかる。予算を守りながら栄養バランスの取れた献立が欲しい。",
        timestamp: "2024-01-15T11:30:00Z",
        user_id: "user_001",
      },
      {
        id: "int_004",
        content:
          "夫が夜遅く帰宅するので、30分以内で調理できる献立だけを提案してもらいたい。",
        timestamp: "2024-01-15T12:00:00Z",
        user_id: "user_001",
      },
      {
        id: "int_005",
        content:
          "長女は和食が好きだが、次男は洋食が好き。家族全員が満足する献立が難しい。",
        timestamp: "2024-01-15T12:30:00Z",
        user_id: "user_001",
      },
    ];

    const result = classifyInterviewRecordsWithPriority({
      interview_records: interview_records,
    });

    // 結果構造の確認
    expect(result).toHaveProperty("classified_records");
    expect(Array.isArray(result.classified_records)).toBe(true);
    expect(result.classified_records.length).toBe(5);

    // 各レコードの分類とスコア検証
    const classified_records = result.classified_records;

    // レコード1: 調理時間制限
    expect(classified_records[0].record_id).toBe("int_001");
    expect(classified_records[0].pain_category).toBe("調理時間制限");
    expect(typeof classified_records[0].priority_score).toBe("number");
    expect(classified_records[0].priority_score).toBeGreaterThanOrEqual(0);
    expect(classified_records[0].priority_score).toBeLessThanOrEqual(100);
    expect(classified_records[0].priority_score).toBe(75);

    // レコード2: 食材制限（アレルギー）
    expect(classified_records[1].record_id).toBe("int_002");
    expect(classified_records[1].pain_category).toBe("食材制限");
    expect(classified_records[1].priority_score).toBeGreaterThanOrEqual(0);
    expect(classified_records[1].priority_score).toBeLessThanOrEqual(100);
    expect(classified_records[1].priority_score).toBe(88);

    // レコード3: 予算制約
    expect(classified_records[2].record_id).toBe("int_003");
    expect(classified_records[2].pain_category).toBe("予算制約");
    expect(classified_records[2].priority_score).toBeGreaterThanOrEqual(0);
    expect(classified_records[2].priority_score).toBeLessThanOrEqual(100);
    expect(classified_records[2].priority_score).toBe(80);

    // レコード4: 調理時間制限
    expect(classified_records[3].record_id).toBe("int_004");
    expect(classified_records[3].pain_category).toBe("調理時間制限");
    expect(classified_records[3].priority_score).toBeGreaterThanOrEqual(0);
    expect(classified_records[3].priority_score).toBeLessThanOrEqual(100);
    expect(classified_records[3].priority_score).toBe(85);

    // レコード5: 家族の嗜好
    expect(classified_records[4].record_id).toBe("int_005");
    expect(classified_records[4].pain_category).toBe("家族の嗜好");
    expect(classified_records[4].priority_score).toBeGreaterThanOrEqual(0);
    expect(classified_records[4].priority_score).toBeLessThanOrEqual(100);
    expect(classified_records[4].priority_score).toBe(72);

    // 相対的優先度の大小関係検証
    // 食材制限（88） > 調理時間制限（85） > 予算制約（80） > 調理時間制限（75） > 家族の嗜好（72）
    expect(classified_records[1].priority_score).toBeGreaterThan(
      classified_records[3].priority_score
    );
    expect(classified_records[3].priority_score).toBeGreaterThan(
      classified_records[2].priority_score
    );
    expect(classified_records[2].priority_score).toBeGreaterThan(
      classified_records[0].priority_score
    );
    expect(classified_records[0].priority_score).toBeGreaterThan(
      classified_records[4].priority_score
    );

    // メタデータ確認
    expect(result).toHaveProperty("total_records_classified");
    expect(result.total_records_classified).toBe(5);
    expect(result).toHaveProperty("unique_categories");
    expect(Array.isArray(result.unique_categories)).toBe(true);
    expect(result.unique_categories.length).toBeGreaterThan(0);
    expect(result.unique_categories).toContain("食材制限");
    expect(result.unique_categories).toContain("調理時間制限");
    expect(result.unique_categories).toContain("予算制約");
    expect(result.unique_categories).toContain("家族の嗜好");

    // 分類処理完了のタイムスタンプ確認
    expect(result).toHaveProperty("classified_at");
    expect(typeof result.classified_at).toBe("string");

    // 各レコードが必須フィールドを持つことを確認
    classified_records.forEach((record) => {
      expect(record).toHaveProperty("record_id");
      expect(record).toHaveProperty("original_content");
      expect(record).toHaveProperty("pain_category");
      expect(record).toHaveProperty("priority_score");
      expect(typeof record.record_id).toBe("string");
      expect(typeof record.original_content).toBe("string");
      expect(typeof record.pain_category).toBe("string");
      expect(typeof record.priority_score).toBe("number");
    });
  });
});