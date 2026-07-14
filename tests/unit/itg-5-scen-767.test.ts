import { classifyRejectionReasons } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-767: [normal] 失敗パターン自動カテゴリ分類機能 - 献立却下・修正理由が定義済みカテゴリに正確に分類される
  test("献立却下・修正理由が定義済みカテゴリに正確に分類される", () => {
    const sampleReasons = [
      {
        reason_id: 1,
        reason_text: "タンパク質が不足している感じがした",
        user_id: "user_001",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        reason_id: 2,
        reason_text: "卵が入っていて困る。息子がアレルギーなのに",
        user_id: "user_001",
        timestamp: "2024-01-15T10:35:00Z",
      },
      {
        reason_id: 3,
        reason_text: "鶏肉ばかりで飽きてしまった",
        user_id: "user_002",
        timestamp: "2024-01-15T11:00:00Z",
      },
      {
        reason_id: 4,
        reason_text: "材料が高い。予算を超過している",
        user_id: "user_002",
        timestamp: "2024-01-15T11:05:00Z",
      },
      {
        reason_id: 5,
        reason_text: "調理時間が90分もかかる。短時間でできる献立がいい",
        user_id: "user_003",
        timestamp: "2024-01-15T11:30:00Z",
      },
      {
        reason_id: 6,
        reason_text: "冷蔵庫にない食材が多すぎて実行できない",
        user_id: "user_003",
        timestamp: "2024-01-15T11:35:00Z",
      },
      {
        reason_id: 7,
        reason_text: "ビタミンCが足りない食事内容のように思える",
        user_id: "user_004",
        timestamp: "2024-01-15T12:00:00Z",
      },
      {
        reason_id: 8,
        reason_text: "子どもが絶対に食べない野菜が入っている",
        user_id: "user_004",
        timestamp: "2024-01-15T12:05:00Z",
      },
    ];

    const result = classifyRejectionReasons(sampleReasons);

    // 分類結果が返却されることを確認
    expect(result).toBeDefined();
    expect(Array.isArray(result.classified_reasons)).toBe(true);
    expect(result.classified_reasons.length).toBe(8);

    // 各理由が対応する正しいカテゴリに分類されたかを個別に検証
    // ID 1: 栄養バランス (タンパク質不足)
    const classified1 = result.classified_reasons.find(
      (c: any) => c.reason_id === 1
    );
    expect(classified1.category).toBe("栄養バランス");
    expect(classified1.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 2: アレルギー対応 (卵アレルギー)
    const classified2 = result.classified_reasons.find(
      (c: any) => c.reason_id === 2
    );
    expect(classified2.category).toBe("アレルギー対応");
    expect(classified2.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 3: 家族好み未反映 (鶏肉ばかりで飽き)
    const classified3 = result.classified_reasons.find(
      (c: any) => c.reason_id === 3
    );
    expect(classified3.category).toBe("家族好み未反映");
    expect(classified3.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 4: コスト (予算超過)
    const classified4 = result.classified_reasons.find(
      (c: any) => c.reason_id === 4
    );
    expect(classified4.category).toBe("コスト");
    expect(classified4.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 5: 調理時間超過 (90分かかる)
    const classified5 = result.classified_reasons.find(
      (c: any) => c.reason_id === 5
    );
    expect(classified5.category).toBe("調理時間超過");
    expect(classified5.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 6: 食材在庫不足 (冷蔵庫にない)
    const classified6 = result.classified_reasons.find(
      (c: any) => c.reason_id === 6
    );
    expect(classified6.category).toBe("食材在庫不足");
    expect(classified6.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 7: 栄養バランス (ビタミンC不足)
    const classified7 = result.classified_reasons.find(
      (c: any) => c.reason_id === 7
    );
    expect(classified7.category).toBe("栄養バランス");
    expect(classified7.confidence).toBeGreaterThanOrEqual(0.95);

    // ID 8: 家族好み未反映 (子どもが食べない野菜)
    const classified8 = result.classified_reasons.find(
      (c: any) => c.reason_id === 8
    );
    expect(classified8.category).toBe("家族好み未反映");
    expect(classified8.confidence).toBeGreaterThanOrEqual(0.95);

    // カテゴリ別集計結果を確認
    expect(result.category_summary).toBeDefined();
    expect(result.category_summary["栄養バランス"]).toBe(2);
    expect(result.category_summary["アレルギー対応"]).toBe(1);
    expect(result.category_summary["家族好み未反映"]).toBe(2);
    expect(result.category_summary["コスト"]).toBe(1);
    expect(result.category_summary["調理時間超過"]).toBe(1);
    expect(result.category_summary["食材在庫不足"]).toBe(1);

    // 全体分類精度が期待値（95%以上）以上であることを検証
    const totalClassified = result.classified_reasons.filter(
      (c: any) => c.confidence >= 0.95
    ).length;
    const classificationAccuracy = (totalClassified / sampleReasons.length) * 100;
    expect(classificationAccuracy).toBeGreaterThanOrEqual(95);

    // 分類失敗数が 0 であることを確認
    expect(result.classification_failures).toBe(0);

    // 定義済みカテゴリのセット確認
    expect(result.defined_categories).toBeDefined();
    expect(Array.isArray(result.defined_categories)).toBe(true);
    expect(result.defined_categories).toContain("栄養バランス");
    expect(result.defined_categories).toContain("アレルギー対応");
    expect(result.defined_categories).toContain("コスト");
    expect(result.defined_categories).toContain("調理時間超過");
    expect(result.defined_categories).toContain("家族好み未反映");
    expect(result.defined_categories).toContain("食材在庫不足");
  });
});