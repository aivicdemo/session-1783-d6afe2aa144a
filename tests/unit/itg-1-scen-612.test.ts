import { calculatePriorityMatrixScore } from "../../src/logic/it-2";

describe("改善提案の優先度マトリクス自動付与", () => {
  test("SCEN-612: 影響度と実装難度が同等の境界値で優先度が一貫して決定される", () => {
    // Test case 1: 影響度3、実装難度3（中程度同等）
    const proposal_3_3 = {
      proposalId: "proposal-001",
      title: "栄養バランス検証ロジック改善",
      description: "献立生成時の栄養基準チェックを強化し、不足栄養素を自動検出する機能を追加",
      impactScore: 3,
      implementationDifficulty: 3,
    };

    const result_3_3 = calculatePriorityMatrixScore(proposal_3_3);

    expect(result_3_3).toEqual({
      proposalId: "proposal-001",
      priorityRank: "MEDIUM",
      priorityScore: 50,
    });

    // Test case 2: 影響度2、実装難度2（低程度同等）
    const proposal_2_2 = {
      proposalId: "proposal-002",
      title: "UI/UX微調整",
      description: "献立確認画面のボタン配置を改善し、ユーザーの操作効率を向上させる",
      impactScore: 2,
      implementationDifficulty: 2,
    };

    const result_2_2 = calculatePriorityMatrixScore(proposal_2_2);

    expect(result_2_2).toEqual({
      proposalId: "proposal-002",
      priorityRank: "LOW",
      priorityScore: 33,
    });

    // Test case 3: 影響度4、実装難度4（高程度同等）
    const proposal_4_4 = {
      proposalId: "proposal-003",
      title: "機械学習モデルの統合",
      description: "家族の嗜好学習を高度化し、個別化された献立提案ロジックを実装",
      impactScore: 4,
      implementationDifficulty: 4,
    };

    const result_4_4 = calculatePriorityMatrixScore(proposal_4_4);

    expect(result_4_4).toEqual({
      proposalId: "proposal-003",
      priorityRank: "MEDIUM_HIGH",
      priorityScore: 67,
    });

    // Test case 4: 影響度5、実装難度5（最高程度同等）
    const proposal_5_5 = {
      proposalId: "proposal-004",
      title: "完全自動化献立生成エンジン実装",
      description: "すべての制約条件を同時最適化し、即座に最適献立を生成するAIエンジンを構築",
      impactScore: 5,
      implementationDifficulty: 5,
    };

    const result_5_5 = calculatePriorityMatrixScore(proposal_5_5);

    expect(result_5_5).toEqual({
      proposalId: "proposal-004",
      priorityRank: "HIGH",
      priorityScore: 100,
    });

    // Test case 5: 影響度1、実装難度1（最小程度同等）
    const proposal_1_1 = {
      proposalId: "proposal-005",
      title: "ヘルプテキストの修正",
      description: "献立生成画面のツールチップを簡潔に表現し直す",
      impactScore: 1,
      implementationDifficulty: 1,
    };

    const result_1_1 = calculatePriorityMatrixScore(proposal_1_1);

    expect(result_1_1).toEqual({
      proposalId: "proposal-005",
      priorityRank: "LOW",
      priorityScore: 17,
    });

    // Consistency verification: 各ケースで優先度ランクが一貫性を保っていることを確認
    const allResults = [result_1_1, result_2_2, result_3_3, result_4_4, result_5_5];
    const priorityScores = allResults.map((r) => r.priorityScore);

    // スコアが昇順であることを検証（一貫性チェック）
    expect(priorityScores[0]).toBeLessThan(priorityScores[1]);
    expect(priorityScores[1]).toBeLessThan(priorityScores[2]);
    expect(priorityScores[2]).toBeLessThan(priorityScores[3]);
    expect(priorityScores[3]).toBeLessThan(priorityScores[4]);

    // 各ランクが一意に決定されていることを確認
    const ranks = allResults.map((r) => r.priorityRank);
    const uniqueRanks = new Set(ranks);
    expect(uniqueRanks.size).toBe(5);
  });
});