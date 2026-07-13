import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  test("SCEN-354: 栄養士の資格情報が無効な場合、改善提案の優先度付けが実行されずエラーが記録される", () => {
    // 前置条件: 栄養士の資格情報が無効な状態（有効期限切れ）
    const invalidNutritionistId = "nutritionist_001";
    const invalidCredentialExpiryDate = new Date("2020-01-15T00:00:00Z"); // 過去日付
    const improvementProposalId = "proposal_001";
    const proposalTitle = "カルシウム摂取基準の見直し";
    const businessValue = 8;
    const technicalDifficulty = 5;
    const userImpact = 9;

    // 資格情報が無効なため、優先度付けが実行されるべきではない
    const invalidCredentialsInput = {
      nutritionistId: invalidNutritionistId,
      credentialExpiryDate: invalidCredentialExpiryDate,
      improvementProposalId: improvementProposalId,
      proposalTitle: proposalTitle,
      businessValue: businessValue,
      technicalDifficulty: technicalDifficulty,
      userImpact: userImpact,
    };

    // エラー発生を期待: 資格情報が無効
    expect(() =>
      prioritizeImprovementProposals(invalidCredentialsInput)
    ).toThrow(/資格情報/);
  });
});