import { classifyRejectReasonCategory } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の分類と失敗パターン特定", () => {
  // SCEN-625
  test("既知カテゴリに該当しない理由テキストは例外処理されエラーログが記録される", () => {
    // Arrange: 既知カテゴリに該当しない献立却下修正理由テキストを準備
    const unknownReasonText = "これは全く新しい理由で、どのカテゴリにも該当しません";
    const reasonId = "reason_001";
    const reasonTimestamp = "2024-01-15T11:00:00Z";

    // 期待されるエラーログのフィールド: 例外の種類、発生時刻、該当しないテキスト内容
    const expectedErrorLogFormat = {
      reasonId: reasonId,
      inputText: unknownReasonText,
      timestamp: reasonTimestamp,
      errorType: "UNKNOWN_CATEGORY",
      errorMessage: expect.stringContaining("カテゴリ"),
      isLogged: true,
    };

    // Act: 自動分類機能に該当テキストを入力し、例外処理が実行される
    // structured.functionName: classifyRejectReasonCategory
    // 既知カテゴリ一覧: "栄養", "予算", "好み", "調理時間", "食材在庫"
    // unknownReasonText は全カテゴリに該当しないため、例外処理が発動
    const result = classifyRejectReasonCategory({
      reasonText: unknownReasonText,
      reasonId: reasonId,
      timestamp: reasonTimestamp,
      knownCategories: [
        "栄養",
        "予算",
        "好み",
        "調理時間",
        "食材在庫",
      ],
    });

    // Assert: 例外が適切に処理され、エラーログが記録されたことを確認
    expect(result).toHaveProperty("isError");
    expect(result.isError).toBe(true);

    // エラーログに例外の種類が含まれていることを検証
    expect(result).toHaveProperty("errorType");
    expect(result.errorType).toBe("UNKNOWN_CATEGORY");

    // エラーログに発生時刻が含まれていることを確認
    expect(result).toHaveProperty("timestamp");
    expect(result.timestamp).toBe(reasonTimestamp);

    // エラーログに該当しないテキスト内容が含まれていることを検証
    expect(result).toHaveProperty("inputText");
    expect(result.inputText).toBe(unknownReasonText);

    // エラーログに適切なエラーメッセージが含まれていることを検証
    expect(result).toHaveProperty("errorMessage");
    expect(result.errorMessage).toMatch(/カテゴリ/);

    // エラーログのタイムスタンプが正確に記録されていることを確認
    expect(result.timestamp).toBe("2024-01-15T11:00:00Z");

    // ログが実際に記録されたことを確認
    expect(result).toHaveProperty("isLogged");
    expect(result.isLogged).toBe(true);

    // 理由IDが正しく記録されていることを確認
    expect(result).toHaveProperty("reasonId");
    expect(result.reasonId).toBe(reasonId);
  });
});