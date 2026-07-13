import { classifyMenuRejectReason } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立却下修正理由の自動分類", () => {
  // SCEN-597
  test("分類不可の却下理由が入力された場合、デフォルトカテゴリに振り分けられるまたはエラーが発生する", () => {
    const unclassifiableReason_1 = "!@#$%^&*()";
    const unclassifiableReason_2 = "不正な記号";
    const unclassifiableReason_3 = ";;;%%%^^^";
    const defaultCategoryName = "その他";
    const unclassifiableCategoryName = "未分類";

    // Pattern 1: 特殊文字のみの入力 → デフォルトカテゴリまたはエラー
    const result_1 = classifyMenuRejectReason({
      rejectReason: unclassifiableReason_1,
    });

    // デフォルトカテゴリに振り分けられるケース
    if (result_1.category) {
      expect([defaultCategoryName, unclassifiableCategoryName]).toContain(
        result_1.category
      );
      expect(result_1.confidence).toBeGreaterThanOrEqual(0);
      expect(result_1.confidence).toBeLessThanOrEqual(1);
      expect(result_1.isSuccessfullyClassified).toBe(true);
    } else {
      // エラーレスポンスのケース
      expect(result_1.error).toBeDefined();
      expect(result_1.error).toMatch(/分類|理由|入力/);
    }

    // Pattern 2: 日本語だが意味不明な入力 → デフォルトカテゴリまたはエラー
    const result_2 = classifyMenuRejectReason({
      rejectReason: unclassifiableReason_2,
    });

    if (result_2.category) {
      expect([defaultCategoryName, unclassifiableCategoryName]).toContain(
        result_2.category
      );
      expect(result_2.confidence).toBeGreaterThanOrEqual(0);
      expect(result_2.confidence).toBeLessThanOrEqual(1);
      expect(result_2.isSuccessfullyClassified).toBe(true);
    } else {
      expect(result_2.error).toBeDefined();
      expect(result_2.error).toMatch(/分類|理由|入力/);
    }

    // Pattern 3: 複数の特殊文字 → デフォルトカテゴリまたはエラー
    const result_3 = classifyMenuRejectReason({
      rejectReason: unclassifiableReason_3,
    });

    if (result_3.category) {
      expect([defaultCategoryName, unclassifiableCategoryName]).toContain(
        result_3.category
      );
      expect(result_3.confidence).toBeGreaterThanOrEqual(0);
      expect(result_3.confidence).toBeLessThanOrEqual(1);
      expect(result_3.isSuccessfullyClassified).toBe(true);
    } else {
      expect(result_3.error).toBeDefined();
      expect(result_3.error).toMatch(/分類|理由|入力/);
    }

    // 正常系：既知のカテゴリに対応する理由が入力された場合
    const validReason = "栄養バランスが悪い";
    const validResult = classifyMenuRejectReason({
      rejectReason: validReason,
    });

    expect(validResult.isSuccessfullyClassified).toBe(true);
    expect(validResult.category).toBeDefined();
    expect(validResult.category).not.toBeNull();
    expect(validResult.confidence).toBeGreaterThan(0.5);

    // 空文字列入力 → エラーまたはデフォルトカテゴリ
    const emptyReasonResult = classifyMenuRejectReason({
      rejectReason: "",
    });

    if (emptyReasonResult.category) {
      expect([defaultCategoryName, unclassifiableCategoryName]).toContain(
        emptyReasonResult.category
      );
    } else {
      expect(emptyReasonResult.error).toBeDefined();
      expect(emptyReasonResult.error).toMatch(/空|必須|入力/);
    }

    // ログ記録の検証: エラーまたはデフォルト振り分けが発生した場合、ログが記録されること
    expect(result_1.timestamp).toBeDefined();
    expect(result_1.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
    expect(result_1.logLevel).toMatch(/info|warn|error/);
  });
});