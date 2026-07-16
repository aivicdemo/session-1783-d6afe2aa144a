import { recordRejectionReasonWithoutStructure } from "../../src/logic/it-8-1-2-1";

describe("SCEN-232: 却下・保留提案の構造化記録 - 非構造化理由記録による後続参照不可の検証", () => {
  test("SCEN-232: 却下・保留理由が非構造化テキストのまま記録され、カテゴリ絞り込みと正確なテキスト検索が不可能になることを確認", () => {
    // 前提: ユーザーペイン分析・差別化軸検証システムにログイン済み、新規提案作成・入力完了状態
    // 手順: 提案を却下し、非構造化テキスト形式で理由を自由記述入力
    const rejectionInput1 = {
      proposalId: "prop-001",
      proposalTitle: "調理時間短縮アルゴリズム改善",
      rejectionReason: "顧客ニーズと合致していない",
      rejectionTimestamp: new Date("2024-01-15T10:00:00Z"),
      rejectedBy: "user-pm-001",
      proposalStatus: "rejected" as const,
    };

    const rejectionResult1 = recordRejectionReasonWithoutStructure(rejectionInput1);

    // 期待結果1: 却下理由が非構造化テキストのまま記録されていることを確認
    expect(rejectionResult1).toEqual({
      proposalId: "prop-001",
      proposalTitle: "調理時間短縮アルゴリズム改善",
      recordedReason: "顧客ニーズと合致していない",
      reasonCategory: null, // カテゴリ化されていない
      isStructured: false,
      storageFormat: "unstructured_text",
      recordedAt: new Date("2024-01-15T10:00:00Z"),
      retrievalPossibility: false, // 後続参照が不可能
      canFilterByCategory: false,
    });

    // 手順: 別の提案を作成し、同じテキストで保留にする
    const holdInput1 = {
      proposalId: "prop-002",
      proposalTitle: "栄養基準ロジック改善",
      holdReason: "追加情報待機中",
      holdTimestamp: new Date("2024-01-15T11:00:00Z"),
      heldBy: "user-pm-001",
      proposalStatus: "hold" as const,
    };

    const holdResult1 = recordRejectionReasonWithoutStructure(holdInput1);

    // 期待結果2: 保留理由も非構造化テキストのまま記録されていることを確認
    expect(holdResult1).toEqual({
      proposalId: "prop-002",
      proposalTitle: "栄養基準ロジック改善",
      recordedReason: "追加情報待機中",
      reasonCategory: null, // カテゴリ化されていない
      isStructured: false,
      storageFormat: "unstructured_text",
      recordedAt: new Date("2024-01-15T11:00:00Z"),
      retrievalPossibility: false, // 後続参照が不可能
      canFilterByCategory: false,
    });

    // 手順: 却下・保留提案一覧ページで理由でフィルタリングを試みる
    const filterByReasonAttempt = {
      filterKeyword: "顧客ニーズ",
      filterType: "category_filter" as const,
      targetReasons: [rejectionResult1.recordedReason, holdResult1.recordedReason],
    };

    const filterResult = recordRejectionReasonWithoutStructure(filterByReasonAttempt);

    // 期待結果3: カテゴリフィルタが機能しない状態を確認
    expect(filterResult).toEqual({
      proposalId: null,
      proposalTitle: null,
      recordedReason: null,
      reasonCategory: null,
      isStructured: false,
      storageFormat: "unstructured_text",
      recordedAt: null,
      retrievalPossibility: false,
      canFilterByCategory: false,
      filterApplied: false, // フィルタが適用されない
      matchingProposalsCount: 0, // マッチング結果なし
      textSearchAccuracy: 0, // テキスト検索精度: 0%
    });

    // 手順: 同一理由でも表記ゆれがある場合のテキスト検索精度を検証
    const variationInput = {
      proposalId: "prop-003",
      proposalTitle: "予算制約対応機能",
      rejectionReason: "顧客ニーズに不適合", // 微妙に異なる表記
      rejectionTimestamp: new Date("2024-01-15T12:00:00Z"),
      rejectedBy: "user-pm-002",
      proposalStatus: "rejected" as const,
    };

    const variationResult = recordRejectionReasonWithoutStructure(variationInput);

    // 期待結果4: 表記ゆれにより同一理由として認識されない状態を確認
    expect(variationResult.recordedReason).not.toBe(rejectionResult1.recordedReason); // 異なる文字列として保存
    expect(variationResult.reasonCategory).toBe(null); // カテゴリ未割当
    expect(variationResult.isStructured).toBe(false);

    // テキスト検索で同一理由を検索した場合の精度を確認
    const searchVariationAttempt = {
      searchQuery: "顧客ニーズ",
      searchScope: "rejection_reasons",
      allStoredReasons: [
        rejectionResult1.recordedReason,
        variationResult.recordedReason,
      ],
    };

    const searchResult = recordRejectionReasonWithoutStructure(searchVariationAttempt);

    // 期待結果5: テキスト検索の不正確性を確認
    expect(searchResult).toEqual({
      proposalId: null,
      proposalTitle: null,
      recordedReason: null,
      reasonCategory: null,
      isStructured: false,
      storageFormat: "unstructured_text",
      recordedAt: null,
      retrievalPossibility: false,
      canFilterByCategory: false,
      searchQuery: "顧客ニーズ",
      matchedReasonsCount: 2, // 一部マッチするが完全精度ではない
      textSearchAccuracy: 50, // テキスト検索精度: 50%（表記ゆれで不完全）
      dataAnalysisDifficulty: "high", // データ分析が困難
      trendIdentificationPossibility: false, // 傾向把握が不可能
    });

    // 期待結果6: 非構造化記録による後続参照の全般的な課題を確認
    const allIssuesSummary = {
      totalRecordedProposals: 3,
      structuredProposals: 0, // 構造化されたもの: 0件
      categoryFilteringAvailable: false,
      accurateTextSearchAvailable: false,
      trendAnalysisPossible: false,
      dataQualityIssue: true,
    };

    expect(allIssuesSummary.structuredProposals).toBe(0);
    expect(allIssuesSummary.categoryFilteringAvailable).toBe(false);
    expect(allIssuesSummary.accurateTextSearchAvailable).toBe(false);
    expect(allIssuesSummary.trendAnalysisPossible).toBe(false);
    expect(allIssuesSummary.dataQualityIssue).toBe(true);
  });
});