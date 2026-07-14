import { describe, test, expect } from "@jest/globals";
import { validateNutritionLogicImprovementProposal } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-867: [error] 栄養士検証評価機能 - 栄養基準ロジック改善案の検証基準が定義されていない場合にエラーが返却される
  test("should throw error when validation criteria is not defined for nutrition logic improvement proposal", () => {
    const improvement_proposal_id = "proposal_001";
    const validation_criteria = undefined;
    const nutritionist_id = "nutritionist_123";

    expect(() =>
      validateNutritionLogicImprovementProposal({
        improvement_proposal_id,
        validation_criteria,
        nutritionist_id,
      })
    ).toThrow(/検証基準/);
  });
});