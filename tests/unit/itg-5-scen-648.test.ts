import { describe, test, expect, beforeEach } from "@jest/globals";
import { classifyRejectionReason } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-648
  test("未定義の却下理由が入力された場合、デフォルトカテゴリに分類される", () => {
    // Arrange
    const undefined_reason_text =
      "システムで定義されていない特殊な理由でこの献立は却下します";
    const expected_default_category = "その他";
    const expected_is_classified = true;

    // Act
    const result = classifyRejectionReason({
      reason_text: undefined_reason_text,
    });

    // Assert
    expect(result.category).toBe(expected_default_category);
    expect(result.is_classified).toBe(expected_is_classified);
    expect(result.confidence_score).toBeGreaterThanOrEqual(0);
    expect(result.confidence_score).toBeLessThanOrEqual(100);
    expect(result.saved_to_system).toBe(true);
  });
});