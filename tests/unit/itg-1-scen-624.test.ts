import { generateImprovementProposalsWithEvidence } from "../../src/logic/it-1-br-4-2-1";

describe("失敗パターンに基づく改善提案の分類 - 改善提案の根拠データ紐付け", () => {
  // SCEN-624
  test("各改善提案に根拠となる失敗パターンデータが正確に紐付けられる", () => {
    const failurePatternDataset = [
      {
        id: "FP-001",
        timestamp: "2024-01-08T18:00:00Z",
        userId: "USR-001",
        failureCategory: "nutrition_imbalance",
        failureDescription: "タンパク質不足で食物繊維が過剰",
        proposalType: "parameter_adjustment",
      },
      {
        id: "FP-002",
        timestamp: "2024-01-09T19:30:00Z",
        userId: "USR-001",
        failureCategory: "nutrition_imbalance",
        failureDescription: "カルシウム不足でビタミンD不足",
        proposalType: "parameter_adjustment",
      },
      {
        id: "FP-003",
        timestamp: "2024-01-10T20:00:00Z",
        userId: "USR-001",
        failureCategory: "family_preference_not_reflected",
        failureDescription: "子どもの嫌いな野菜が含まれた",
        proposalType: "algorithm_modification",
      },
      {
        id: "FP-004",
        timestamp: "2024-01-11T17:45:00Z",
        userId: "USR-001",
        failureCategory: "cooking_time_exceeded",
        failureDescription: "調理時間が60分を超過",
        proposalType: "algorithm_modification",
      },
      {
        id: "FP-005",
        timestamp: "2024-01-12T19:15:00Z",
        userId: "USR-001",
        failureCategory: "food_restriction_missed",
        failureDescription: "豆類アレルギーの家族成員の食材が含まれた",
        proposalType: "new_feature",
      },
    ];

    const result = generateImprovementProposalsWithEvidence(
      failurePatternDataset
    );

    // 改善提案が3つ生成されることを検証
    expect(result.proposals).toHaveLength(3);

    // 提案1: パラメータ調整（栄養バランス）
    const proposal1 = result.proposals[0];
    expect(proposal1.id).toBe("PROP-001");
    expect(proposal1.type).toBe("parameter_adjustment");
    expect(proposal1.title).toBe("栄養バランス最適化パラメータの調整");
    expect(proposal1.evidencePatternIds).toEqual(["FP-001", "FP-002"]);
    expect(proposal1.evidencePatternIds).toHaveLength(2);

    // 提案1の根拠データが正確に紐付けられていることを検証
    const evidence1 = proposal1.evidenceData;
    expect(evidence1).toHaveLength(2);
    expect(evidence1[0].id).toBe("FP-001");
    expect(evidence1[0].timestamp).toBe("2024-01-08T18:00:00Z");
    expect(evidence1[0].failureCategory).toBe("nutrition_imbalance");
    expect(evidence1[0].failureDescription).toBe(
      "タンパク質不足で食物繊維が過剰"
    );
    expect(evidence1[1].id).toBe("FP-002");
    expect(evidence1[1].timestamp).toBe("2024-01-09T19:30:00Z");
    expect(evidence1[1].failureCategory).toBe("nutrition_imbalance");
    expect(evidence1[1].failureDescription).toBe("カルシウム不足でビタミンD不足");

    // 提案2: アルゴリズム修正（嗜好・調理時間）
    const proposal2 = result.proposals[1];
    expect(proposal2.id).toBe("PROP-002");
    expect(proposal2.type).toBe("algorithm_modification");
    expect(proposal2.title).toBe(
      "家族嗜好と調理時間制約の統合最適化アルゴリズム"
    );
    expect(proposal2.evidencePatternIds).toEqual(["FP-003", "FP-004"]);
    expect(proposal2.evidencePatternIds).toHaveLength(2);

    // 提案2の根拠データが正確に紐付けられていることを検証
    const evidence2 = proposal2.evidenceData;
    expect(evidence2).toHaveLength(2);
    expect(evidence2[0].id).toBe("FP-003");
    expect(evidence2[0].timestamp).toBe("2024-01-10T20:00:00Z");
    expect(evidence2[0].failureCategory).toBe("family_preference_not_reflected");
    expect(evidence2[0].failureDescription).toBe(
      "子どもの嫌いな野菜が含まれた"
    );
    expect(evidence2[1].id).toBe("FP-004");
    expect(evidence2[1].timestamp).toBe("2024-01-11T17:45:00Z");
    expect(evidence2[1].failureCategory).toBe("cooking_time_exceeded");
    expect(evidence2[1].failureDescription).toBe("調理時間が60分を超過");

    // 提案3: 新機能（食事制限の多層検証）
    const proposal3 = result.proposals[2];
    expect(proposal3.id).toBe("PROP-003");
    expect(proposal3.type).toBe("new_feature");
    expect(proposal3.title).toBe(
      "複数家族成員の食事制限の多層検証機能実装"
    );
    expect(proposal3.evidencePatternIds).toEqual(["FP-005"]);
    expect(proposal3.evidencePatternIds).toHaveLength(1);

    // 提案3の根拠データが正確に紐付けられていることを検証
    const evidence3 = proposal3.evidenceData;
    expect(evidence3).toHaveLength(1);
    expect(evidence3[0].id).toBe("FP-005");
    expect(evidence3[0].timestamp).toBe("2024-01-12T19:15:00Z");
    expect(evidence3[0].failureCategory).toBe("food_restriction_missed");
    expect(evidence3[0].failureDescription).toBe(
      "豆類アレルギーの家族成員の食材が含まれた"
    );

    // すべての改善提案が根拠データを保有していることを確認
    result.proposals.forEach((proposal) => {
      expect(proposal.evidenceData).toBeDefined();
      expect(proposal.evidenceData.length).toBeGreaterThan(0);
      expect(proposal.evidencePatternIds.length).toBe(
        proposal.evidenceData.length
      );
    });

    // 根拠データが存在しない改善提案がないことを確認
    const proposalsWithoutEvidence = result.proposals.filter(
      (p) => !p.evidenceData || p.evidenceData.length === 0
    );
    expect(proposalsWithoutEvidence).toHaveLength(0);

    // 全体の統計情報を検証
    expect(result.totalFailurePatterns).toBe(5);
    expect(result.totalProposals).toBe(3);
    expect(result.evidenceCoverageRate).toBe(1.0); // 100% - すべての失敗パターンが提案の根拠に使用されている
  });
});