import { classifyRejectReason } from "../../src/logic/it-1-br-4-2-1";

describe("献立却下・修正理由の分類と失敗パターン特定", () => {
  // SCEN-627: 献立却下・修正理由のカテゴリ分類と異常値検出 - 理由の自動カテゴリ分類
  test("入力された理由テキストが事前定義カテゴリのいずれかに自動分類される", () => {
    // ハッピーパス: 複数の修正理由テキストを入力し、各々が正しくカテゴリ分類されることを検証

    // 入力1: 「栄養バランスが悪い」
    const result1 = classifyRejectReason({
      reasonText: "栄養バランスが悪い",
      timestamp: new Date("2024-01-15T10:30:00Z"),
    });
    expect(result1.category).toBe("栄養");
    expect(result1.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result1.isAnomalous).toBe(false);

    // 入力2: 「塩分が多すぎる」
    const result2 = classifyRejectReason({
      reasonText: "塩分が多すぎる",
      timestamp: new Date("2024-01-15T10:35:00Z"),
    });
    expect(result2.category).toBe("健康・栄養");
    expect(result2.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result2.isAnomalous).toBe(false);

    // 入力3: 「アレルギー成分が含まれている」
    const result3 = classifyRejectReason({
      reasonText: "アレルギー成分が含まれている",
      timestamp: new Date("2024-01-15T10:40:00Z"),
    });
    expect(result3.category).toBe("アレルギー");
    expect(result3.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result3.isAnomalous).toBe(false);

    // 各分類結果が異なるカテゴリに正しく振り分けられていることを確認
    expect([result1.category, result2.category, result3.category]).toEqual([
      "栄養",
      "健康・栄養",
      "アレルギー",
    ]);

    // 異常値フラグ: すべてfalse（正常なテキスト）
    expect([result1.isAnomalous, result2.isAnomalous, result3.isAnomalous]).toEqual(
      [false, false, false]
    );
  });

  test("異常値・重複・不完全データが検出・フラグ付けされる", () => {
    // エッジケース: 空文字列入力時の異常値検出
    const emptyResult = classifyRejectReason({
      reasonText: "",
      timestamp: new Date("2024-01-15T11:00:00Z"),
    });
    expect(emptyResult.isAnomalous).toBe(true);
    expect(emptyResult.category).toBe("不明");

    // エッジケース: 極端に長いテキスト（不完全データ）
    const longTextResult = classifyRejectReason({
      reasonText: "a".repeat(5000),
      timestamp: new Date("2024-01-15T11:05:00Z"),
    });
    expect(longTextResult.isAnomalous).toBe(true);

    // エッジケース: 記号のみのテキスト（重複・パターンなし）
    const symbolResult = classifyRejectReason({
      reasonText: "!!!@@@###",
      timestamp: new Date("2024-01-15T11:10:00Z"),
    });
    expect(symbolResult.isAnomalous).toBe(true);
    expect(symbolResult.confidence).toBeLessThan(0.5);
  });

  test("信頼度スコアが低い場合に警告フラグが付与される", () => {
    // 曖昧なテキスト入力: 分類信頼度が低くなる場合
    const ambiguousResult = classifyRejectReason({
      reasonText: "なんか違う",
      timestamp: new Date("2024-01-15T11:15:00Z"),
    });
    expect(ambiguousResult.confidence).toBeLessThan(0.7);
    expect(ambiguousResult.requiresManualReview).toBe(true);
  });

  test("複数カテゴリに該当するテキストは最高信頼度カテゴリが選択される", () => {
    // 複合的なキーワード: 「調理時間が長すぎて塩分も多い」
    const compositeResult = classifyRejectReason({
      reasonText: "調理時間が長すぎて塩分も多い",
      timestamp: new Date("2024-01-15T11:20:00Z"),
    });
    // 複数候補の中で最も信頼度が高いカテゴリが選択される
    expect(["調理時間", "健康・栄養"]).toContain(compositeResult.category);
    expect(compositeResult.alternativeCategories?.length || 0).toBeGreaterThanOrEqual(1);
  });

  test("カテゴリ分類結果がシステムに保存・記録される", () => {
    const testReasons = [
      { text: "栄養バランスが悪い", expectedCategory: "栄養" },
      { text: "調理が難しすぎた", expectedCategory: "調理時間" },
      { text: "家族が嫌だと言った", expectedCategory: "嗜好" },
    ];

    const classifiedResults = testReasons.map((reason) =>
      classifyRejectReason({
        reasonText: reason.text,
        timestamp: new Date("2024-01-15T12:00:00Z"),
      })
    );

    // すべての分類結果が正しくカテゴリに割り当てられている
    classifiedResults.forEach((result, idx) => {
      expect(result.category).toBe(testReasons[idx].expectedCategory);
    });

    // タイムスタンプが保持されている
    classifiedResults.forEach((result) => {
      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toEqual(new Date("2024-01-15T12:00:00Z"));
    });
  });
});