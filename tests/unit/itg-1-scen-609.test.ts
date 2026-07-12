import { classifyRejectionReason } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-609: [edge] 献立却下修正理由の自動分類 - 複数のカテゴリに該当する却下理由が優先度順に分類される
  test("複数のカテゴリに該当する却下理由は優先度の最も高いカテゴリに一意に分類される", () => {
    // テストケース1: 栄養バランスとコストが混在（優先度：栄養 > コスト）
    const reason1 = "栄養バランスが悪く、材料が高い";
    const result1 = classifyRejectionReason(reason1);
    expect(result1).toEqual({
      category: "nutrition",
      confidence: expect.any(Number),
      matchedKeywords: expect.any(Array),
    });
    expect(result1.category).toBe("nutrition");

    // テストケース2: コストと調理時間が混在（優先度：栄養 > コスト > 調理時間、コストが最優先）
    const reason2 = "材料が高くて、調理に時間がかかりすぎる";
    const result2 = classifyRejectionReason(reason2);
    expect(result2).toEqual({
      category: "cost",
      confidence: expect.any(Number),
      matchedKeywords: expect.any(Array),
    });
    expect(result2.category).toBe("cost");

    // テストケース3: 栄養、コスト、調理時間がすべて混在（最優先は栄養）
    const reason3 =
      "栄養バランスが足りない上に、食材は高く、調理時間も長すぎる";
    const result3 = classifyRejectionReason(reason3);
    expect(result3).toEqual({
      category: "nutrition",
      confidence: expect.any(Number),
      matchedKeywords: expect.any(Array),
    });
    expect(result3.category).toBe("nutrition");

    // テストケース4: 調理時間と家族の好みが混在（優先度：栄養 > コスト > 調理時間 > 好み、調理時間が最優先）
    const reason4 = "調理に時間がかかって、子どもが好みません";
    const result4 = classifyRejectionReason(reason4);
    expect(result4).toEqual({
      category: "cookingTime",
      confidence: expect.any(Number),
      matchedKeywords: expect.any(Array),
    });
    expect(result4.category).toBe("cookingTime");

    // テストケース5: 複数カテゴリが該当する場合、複数カテゴリが同時に割り当てられないことを確認
    const reason5 =
      "栄養が悪い上に予算オーバーで調理も難しい操作が必要です";
    const result5 = classifyRejectionReason(reason5);
    expect(Array.isArray(result5.category)).toBe(false);
    expect(typeof result5.category).toBe("string");
    expect(result5.category).toBe("nutrition");

    // 全テストケースで期待値の形式を確認
    [result1, result2, result3, result4, result5].forEach((result) => {
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("matchedKeywords");
      expect(typeof result.category).toBe("string");
      expect(typeof result.confidence).toBe("number");
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.matchedKeywords)).toBe(true);
    });
  });
});