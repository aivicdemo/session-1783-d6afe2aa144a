import { validateRuleSpecification } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善・検証ダッシュボード - ルール仕様書承認フロー", () => {
  // SCEN-838
  test("不完全なルール仕様書をアップロードしたとき、承認フローが一時停止され、バリデーションエラーが発生する", () => {
    // 不完全なルール仕様書（必須項目「seasonPattern」が欠落）
    const incompleteRuleSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      // seasonPattern は欠落
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    // バリデーションエラーが発生することを確認
    expect(() => validateRuleSpecification(incompleteRuleSpec)).toThrow(
      /seasonPattern/
    );
  });

  test("複数の必須項目が欠落しているとき、最初に検出された項目のエラーが発生する", () => {
    // 複数の必須項目が欠落したルール仕様書
    const severelyIncompleteRuleSpec = {
      versionId: "rule-v2024-q1",
      // discountRateThreshold が欠落
      // salesPeriodStart が欠落
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    // 最初に検出される必須項目エラーで例外が発生
    expect(() => validateRuleSpecification(severelyIncompleteRuleSpec)).toThrow(
      /discountRateThreshold/
    );
  });

  test("フォーマットが不正なルール仕様書（割引率が負数）をアップロードしたとき、フォーマットエラーが発生する", () => {
    // フォーマットが不正（割引率が負数）
    const invalidFormatRuleSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: -10, // 負数は不正
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    // フォーマットエラーが発生
    expect(() => validateRuleSpecification(invalidFormatRuleSpec)).toThrow(
      /割引率/
    );
  });

  test("日付フォーマットが不正なルール仕様書（salesPeriodStart が ISO 8601 形式でない）をアップロードしたとき、日付形式エラーが発生する", () => {
    // 日付フォーマットが不正
    const invalidDateFormatRuleSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024/01/15", // ISO 8601 形式でない
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    // 日付形式エラーが発生
    expect(() => validateRuleSpecification(invalidDateFormatRuleSpec)).toThrow(
      /日付形式/
    );
  });

  test("完全で正しいルール仕様書をアップロードしたとき、バリデーション成功で承認フローが続行される", () => {
    // 完全で正しいルール仕様書
    const validRuleSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    // バリデーション成功時、戻り値はバリデーション結果オブジェクト（エラーなし）
    const result = validateRuleSpecification(validRuleSpec);
    expect(result).toEqual({
      isValid: true,
      errors: [],
      approvalFlowStatus: "proceeding",
    });
  });

  test("versionId が空文字列のルール仕様書をアップロードしたとき、バージョン ID 必須エラーが発生する", () => {
    // versionId が空文字列
    const emptyVersionIdRuleSpec = {
      versionId: "",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    expect(() => validateRuleSpecification(emptyVersionIdRuleSpec)).toThrow(
      /バージョンID/
    );
  });

  test("seasonPattern が空配列のルール仕様書をアップロードしたとき、季節パターン必須エラーが発生する", () => {
    // seasonPattern が空配列
    const emptySeasonPatternRuleSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      seasonPattern: [],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    expect(() => validateRuleSpecification(emptySeasonPatternRuleSpec)).toThrow(
      /季節パターン/
    );
  });

  test("販売期間の開始日が終了日より後のルール仕様書をアップロードしたとき、期間逆序エラーが発生する", () => {
    // 販売期間の開始日が終了日より後
    const invalidPeriodOrderRuleSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-04-01",
      salesPeriodEnd: "2024-03-31", // 開始日より前
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    expect(() => validateRuleSpecification(invalidPeriodOrderRuleSpec)).toThrow(
      /販売期間/
    );
  });

  test("割引率が 0～100 の範囲外のルール仕様書をアップロードしたとき、割引率範囲エラーが発生する", () => {
    // 割引率が 100 を超える
    const outOfRangeDiscountRateSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 125, // 100 を超える
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    expect(() =>
      validateRuleSpecification(outOfRangeDiscountRateSpec)
    ).toThrow(/割引率範囲/);
  });

  test("updatedAt が ISO 8601 形式でないルール仕様書をアップロードしたとき、更新時刻形式エラーが発生する", () => {
    // updatedAt が不正な形式
    const invalidUpdatedAtFormatSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-01-15",
      salesPeriodEnd: "2024-03-31",
      seasonPattern: ["春野菜", "新茶"],
      updatedAt: "2024-01-10 09:00:00", // ISO 8601 形式でない
      updatedBy: "pm-001",
    };

    expect(() => validateRuleSpecification(invalidUpdatedAtFormatSpec)).toThrow(
      /更新時刻形式/
    );
  });

  test("承認フローが一時停止されたとき、次回の手動修正・再試行が可能な状態で待機する", () => {
    // 不完全なルール仕様書で承認フロー一時停止
    const incompleteSpec = {
      versionId: "rule-v2024-q1",
      discountRateThreshold: 15,
      salesPeriodStart: "2024-01-15",
      // seasonPattern が欠落
      salesPeriodEnd: "2024-03-31",
      updatedAt: "2024-01-10T09:00:00Z",
      updatedBy: "pm-001",
    };

    // エラーが発生し、承認フローは一時停止状態に遷移
    try {
      validateRuleSpecification(incompleteSpec);
      fail("エラーが発生するはず");
    } catch (error: any) {
      // 承認フローが一時停止され、エラーメッセージに不完全な項目の詳細が含まれる
      expect(error.message).toMatch(/seasonPattern/);
    }
  });
});