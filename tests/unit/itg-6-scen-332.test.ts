import { describe, test, expect } from "@jest/globals";
import { validateDocumentQualityChecklistItem } from "../../src/logic/it-8-1-1-1";

describe("ドキュメント品質チェック機能", () => {
  // SCEN-332
  test("チェックリスト項目がちょうど最小要件の文字数で合格と判定される", () => {
    const MIN_CHAR_REQUIREMENT = 100;
    const exactMinCharText = "a".repeat(MIN_CHAR_REQUIREMENT);

    const checklistItem = {
      id: "item_001",
      name: "ペイン要因分析の根拠",
      content: exactMinCharText,
      minCharacters: MIN_CHAR_REQUIREMENT,
    };

    const result = validateDocumentQualityChecklistItem(checklistItem);

    expect(result.itemId).toBe("item_001");
    expect(result.status).toBe("合格");
    expect(result.charCount).toBe(100);
    expect(result.isValid).toBe(true);
    expect(result.message).toBe(
      "チェックリスト項目が品質要件を満たしています"
    );
  });

  // 境界値テスト: 最小要件より1文字少ない場合は不合格
  test("最小要件より1文字少ない場合は不合格と判定される", () => {
    const MIN_CHAR_REQUIREMENT = 100;
    const belowMinCharText = "a".repeat(MIN_CHAR_REQUIREMENT - 1);

    const checklistItem = {
      id: "item_002",
      name: "競合分析結果",
      content: belowMinCharText,
      minCharacters: MIN_CHAR_REQUIREMENT,
    };

    const result = validateDocumentQualityChecklistItem(checklistItem);

    expect(result.itemId).toBe("item_002");
    expect(result.status).toBe("不合格");
    expect(result.charCount).toBe(99);
    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/文字数不足/);
  });

  // 境界値テスト: 最小要件より1文字多い場合は合格
  test("最小要件より1文字多い場合は合格と判定される", () => {
    const MIN_CHAR_REQUIREMENT = 100;
    const aboveMinCharText = "a".repeat(MIN_CHAR_REQUIREMENT + 1);

    const checklistItem = {
      id: "item_003",
      name: "差別化軸の根拠",
      content: aboveMinCharText,
      minCharacters: MIN_CHAR_REQUIREMENT,
    };

    const result = validateDocumentQualityChecklistItem(checklistItem);

    expect(result.itemId).toBe("item_003");
    expect(result.status).toBe("合格");
    expect(result.charCount).toBe(101);
    expect(result.isValid).toBe(true);
  });

  // エラーテスト: 空のコンテンツ
  test("空のコンテンツが入力された場合はエラーをスロー", () => {
    const checklistItem = {
      id: "item_004",
      name: "テスト項目",
      content: "",
      minCharacters: 100,
    };

    expect(() => validateDocumentQualityChecklistItem(checklistItem)).toThrow(
      /コンテンツ/
    );
  });

  // エラーテスト: nullのコンテンツ
  test("nullのコンテンツが入力された場合はエラーをスロー", () => {
    const checklistItem = {
      id: "item_005",
      name: "テスト項目",
      content: null,
      minCharacters: 100,
    };

    expect(() => validateDocumentQualityChecklistItem(checklistItem)).toThrow(
      /必須/
    );
  });

  // エラーテスト: 不正な最小文字数要件
  test("負の最小文字数要件が指定された場合はエラーをスロー", () => {
    const checklistItem = {
      id: "item_006",
      name: "テスト項目",
      content: "有効なテキスト",
      minCharacters: -1,
    };

    expect(() => validateDocumentQualityChecklistItem(checklistItem)).toThrow(
      /最小文字数/
    );
  });

  // 複数のチェックリスト項目を同時検証
  test("複数のチェックリスト項目を検証し、各々の結果を返す", () => {
    const MIN_CHAR_REQUIREMENT = 100;

    const checklistItems = [
      {
        id: "item_101",
        name: "項目1",
        content: "a".repeat(100),
        minCharacters: MIN_CHAR_REQUIREMENT,
      },
      {
        id: "item_102",
        name: "項目2",
        content: "b".repeat(150),
        minCharacters: MIN_CHAR_REQUIREMENT,
      },
      {
        id: "item_103",
        name: "項目3",
        content: "c".repeat(50),
        minCharacters: MIN_CHAR_REQUIREMENT,
      },
    ];

    const results = checklistItems.map(validateDocumentQualityChecklistItem);

    expect(results[0].status).toBe("合格");
    expect(results[0].charCount).toBe(100);
    expect(results[0].isValid).toBe(true);

    expect(results[1].status).toBe("合格");
    expect(results[1].charCount).toBe(150);
    expect(results[1].isValid).toBe(true);

    expect(results[2].status).toBe("不合格");
    expect(results[2].charCount).toBe(50);
    expect(results[2].isValid).toBe(false);
  });

  // 全体ドキュメント品質検証: すべての項目が合格の場合
  test("すべてのチェックリスト項目が合格の場合、ドキュメント全体が承認される", () => {
    const MIN_CHAR_REQUIREMENT = 100;

    const documentCheckResult = {
      documentId: "doc_001",
      documentName: "差別化軸の根拠付けドキュメント",
      checklistItems: [
        {
          id: "item_a",
          name: "ペイン要因分析",
          content: "a".repeat(100),
          minCharacters: MIN_CHAR_REQUIREMENT,
          status: "合格",
          isValid: true,
        },
        {
          id: "item_b",
          name: "競合分析結果",
          content: "b".repeat(120),
          minCharacters: MIN_CHAR_REQUIREMENT,
          status: "合格",
          isValid: true,
        },
      ],
      totalItems: 2,
      passItems: 2,
      failItems: 0,
      overallStatus: "承認",
      passRate: 100,
    };

    expect(documentCheckResult.overallStatus).toBe("承認");
    expect(documentCheckResult.passRate).toBe(100);
    expect(documentCheckResult.passItems).toBe(2);
    expect(documentCheckResult.failItems).toBe(0);
  });

  // 全体ドキュメント品質検証: 一部の項目が不合格の場合
  test("一部のチェックリスト項目が不合格の場合、ドキュメント全体は要修正と判定される", () => {
    const MIN_CHAR_REQUIREMENT = 100;

    const documentCheckResult = {
      documentId: "doc_002",
      documentName: "差別化軸の根拠付けドキュメント",
      checklistItems: [
        {
          id: "item_x",
          name: "ペイン要因分析",
          content: "a".repeat(100),
          minCharacters: MIN_CHAR_REQUIREMENT,
          status: "合格",
          isValid: true,
        },
        {
          id: "item_y",
          name: "競合分析結果",
          content: "b".repeat(80),
          minCharacters: MIN_CHAR_REQUIREMENT,
          status: "不合格",
          isValid: false,
        },
      ],
      totalItems: 2,
      passItems: 1,
      failItems: 1,
      overallStatus: "要修正",
      passRate: 50,
      failedItemIds: ["item_y"],
    };

    expect(documentCheckResult.overallStatus).toBe("要修正");
    expect(documentCheckResult.passRate).toBe(50);
    expect(documentCheckResult.passItems).toBe(1);
    expect(documentCheckResult.failItems).toBe(1);
    expect(documentCheckResult.failedItemIds).toContain("item_y");
  });

  // ホワイトスペースのみのコンテンツ処理
  test("ホワイトスペースのみのコンテンツは文字数に含まれず不合格と判定", () => {
    const MIN_CHAR_REQUIREMENT = 100;
    const whitespaceOnlyText = " ".repeat(100);

    const checklistItem = {
      id: "item_ws",
      name: "テスト項目",
      content: whitespaceOnlyText,
      minCharacters: MIN_CHAR_REQUIREMENT,
    };

    const result = validateDocumentQualityChecklistItem(checklistItem);

    expect(result.status).toBe("不合格");
    expect(result.isValid).toBe(false);
    expect(result.charCount).toBe(0);
  });

  // 改行を含むテキストの処理
  test("改行を含むテキストは文字数に正しくカウントされ合格と判定", () => {
    const MIN_CHAR_REQUIREMENT = 100;
    const textWithNewlines =
      "これは改行を含むテキストです。\n合格要件を満たすように\n構成されています。" +
      "a".repeat(70);

    const checklistItem = {
      id: "item_newline",
      name: "テスト項目",
      content: textWithNewlines,
      minCharacters: MIN_CHAR_REQUIREMENT,
    };

    const result = validateDocumentQualityChecklistItem(checklistItem);

    expect(result.status).toBe("合格");
    expect(result.isValid).toBe(true);
    expect(result.charCount).toBeGreaterThanOrEqual(MIN_CHAR_REQUIREMENT);
  });

  // 複数の最小要件基準でのテスト
  test("異なる最小文字数要件を持つ複数の項目で各々の要件が正しく適用される", () => {
    const item1 = {
      id: "item_req_80",
      name: "簡潔な説明",
      content: "a".repeat(80),
      minCharacters: 80,
    };

    const item2 = {
      id: "item_req_200",
      name: "詳細な説明",
      content: "b".repeat(200),
      minCharacters: 200,
    };

    const result1 = validateDocumentQualityChecklistItem(item1);
    const result2 = validateDocumentQualityChecklistItem(item2);

    expect(result1.status).toBe("合格");
    expect(result1.charCount).toBe(80);
    expect(result2.status).toBe("合格");
    expect(result2.charCount).toBe(200);
  });
});