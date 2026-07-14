// SCEN-820
import { validateAndCreateRuleSpecVersion } from "../../src/logic/it-7-2-1";

describe("ルール仕様書バージョン管理機能 - 不正な形式のファイル処理", () => {
  test("不正な形式のルール仕様書が送信された場合、バリデーションエラーが返却される", () => {
    // 準備: 破損したJSONファイルシミュレーション
    const invalidJsonContent = "{invalid json content";
    const invalidJsonFile = {
      name: "rule_spec.json",
      content: invalidJsonContent,
      mimeType: "application/json",
    };

    // 実行 & 検証: 破損したJSONファイル
    expect(() =>
      validateAndCreateRuleSpecVersion({
        fileContent: invalidJsonFile.content,
        fileName: invalidJsonFile.name,
        mimeType: invalidJsonFile.mimeType,
      })
    ).toThrow(/形式/);

    // 準備: サポートされていない拡張子ファイル
    const unsupportedExtFile = {
      name: "rule_spec.xlsx",
      content: "unsupported file content",
      mimeType: "application/vnd.ms-excel",
    };

    // 実行 & 検証: サポートされていない拡張子
    expect(() =>
      validateAndCreateRuleSpecVersion({
        fileContent: unsupportedExtFile.content,
        fileName: unsupportedExtFile.name,
        mimeType: unsupportedExtFile.mimeType,
      })
    ).toThrow(/形式/);

    // 準備: 正当なJSON形式だが、必須フィールドが欠落しているケース
    const missingFieldJson = JSON.stringify({
      seasonalPattern: ["spring", "summer"],
      // discountRateThreshold フィールドが欠落
      salesPeriod: ["2024-01-01", "2024-12-31"],
    });

    const incompleteFile = {
      name: "rule_spec.json",
      content: missingFieldJson,
      mimeType: "application/json",
    };

    // 実行 & 検証: 必須フィールド欠落
    expect(() =>
      validateAndCreateRuleSpecVersion({
        fileContent: incompleteFile.content,
        fileName: incompleteFile.name,
        mimeType: incompleteFile.mimeType,
      })
    ).toThrow(/形式/);

    // 準備: 正当なルール仕様書ファイル（期待出力計算用）
    const validRuleSpec = {
      versionNumber: 1,
      seasonalPattern: ["spring", "summer", "autumn", "winter"],
      discountRateThreshold: 15,
      salesPeriod: ["2024-01-01", "2024-12-31"],
      lastUpdated: "2024-01-15T11:00:00Z",
      createdBy: "pm_user_001",
      status: "active",
    };

    const validJson = JSON.stringify(validRuleSpec);
    const validFile = {
      name: "rule_spec.json",
      content: validJson,
      mimeType: "application/json",
    };

    // 実行: 正当なファイル処理
    const result = validateAndCreateRuleSpecVersion({
      fileContent: validFile.content,
      fileName: validFile.name,
      mimeType: validFile.mimeType,
    });

    // 検証: 正常系戻り値の構造と値
    expect(result).toEqual({
      versionId: expect.any(String),
      versionNumber: 1,
      seasonalPattern: ["spring", "summer", "autumn", "winter"],
      discountRateThreshold: 15,
      salesPeriod: ["2024-01-01", "2024-12-31"],
      lastUpdated: "2024-01-15T11:00:00Z",
      createdBy: "pm_user_001",
      status: "active",
      validationStatus: "passed",
      httpStatusCode: 200,
    });

    // 追加検証: バージョン履歴が正しく記録されたか
    expect(result.versionId).toBeTruthy();
    expect(result.validationStatus).toBe("passed");
    expect(result.httpStatusCode).toBe(200);
  });
});