import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  recordRejectionReasons,
  retrieveRejectionHistory,
} from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の分類と失敗パターン特定 - 改善提案却下・保留理由記録機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-742: [normal] 改善提案却下・保留理由記録機能 - 複数の却下・保留理由を組み合わせて記録し、次回検討時に正しく参照できる
  test("should record multiple rejection reasons with detailed explanations and retrieve them correctly for future review", () => {
    // 改善提案ID: PT-2024-001
    const proposal_id = "PT-2024-001";

    // 複数の却下・保留理由を定義
    const rejection_reasons = [
      {
        reason_id: "REJECT_001",
        reason_name: "技術的実現性が低い",
        detail_text:
          "現在のアーキテクチャでは3ヶ月以上の開発期間が必要となり、Q2スプリント内での実装が困難",
      },
      {
        reason_id: "REJECT_002",
        reason_name: "優先度が低い",
        detail_text:
          "ユーザー満足度への直接的な寄与度が5%未満と評価され、他の提案と比較して優先度が低い",
      },
      {
        reason_id: "REJECT_003",
        reason_name: "予算不足",
        detail_text:
          "当四半期の開発予算配分已定済みで、追加投資が承認されない可能性が高い",
      },
    ];

    const record_timestamp = new Date("2024-12-15T14:30:00Z").toISOString();
    const recorded_by_user_id = "USER-PM-001";
    const rejection_status = "保留";

    // Step 1: 複数理由を記録する
    const record_result = recordRejectionReasons({
      proposal_id,
      rejection_reasons,
      recorded_by_user_id,
      rejection_status,
      record_timestamp,
    });

    // 記録が成功し、すべての理由が保存されたことを確認
    expect(record_result).toEqual({
      success: true,
      proposal_id,
      recorded_reasons_count: 3,
      record_timestamp,
      status_code: 200,
    });

    // Step 2: 記録された理由を次回検討時に参照する
    const next_review_date = new Date("2025-01-12T09:00:00Z").toISOString();

    const retrieval_result = retrieveRejectionHistory({
      proposal_id,
      retrieval_timestamp: next_review_date,
    });

    // 履歴から全ての記録された理由が正確に参照できることを確認
    expect(retrieval_result).toEqual({
      proposal_id,
      historical_records: [
        {
          record_sequence: 1,
          reason_id: "REJECT_001",
          reason_name: "技術的実現性が低い",
          detail_text:
            "現在のアーキテクチャでは3ヶ月以上の開発期間が必要となり、Q2スプリント内での実装が困難",
          recorded_timestamp: "2024-12-15T14:30:00Z",
          recorded_by_user_id: "USER-PM-001",
        },
        {
          record_sequence: 2,
          reason_id: "REJECT_002",
          reason_name: "優先度が低い",
          detail_text:
            "ユーザー満足度への直接的な寄与度が5%未満と評価され、他の提案と比較して優先度が低い",
          recorded_timestamp: "2024-12-15T14:30:00Z",
          recorded_by_user_id: "USER-PM-001",
        },
        {
          record_sequence: 3,
          reason_id: "REJECT_003",
          reason_name: "予算不足",
          detail_text:
            "当四半期の開発予算配分已定済みで、追加投資が承認されない可能性が高い",
          recorded_timestamp: "2024-12-15T14:30:00Z",
          recorded_by_user_id: "USER-PM-001",
        },
      ],
      total_records: 3,
      last_status: "保留",
      retrieval_timestamp: next_review_date,
      status_code: 200,
    });

    // 各理由の詳細説明テキストが正確に保存・表示されていることを検証
    const retrieved_detail_texts = retrieval_result.historical_records.map(
      (record) => record.detail_text
    );

    expect(retrieved_detail_texts).toContain(
      "現在のアーキテクチャでは3ヶ月以上の開発期間が必要となり、Q2スプリント内での実装が困難"
    );
    expect(retrieved_detail_texts).toContain(
      "ユーザー満足度への直接的な寄与度が5%未満と評価され、他の提案と比較して優先度が低い"
    );
    expect(retrieved_detail_texts).toContain(
      "当四半期の開発予算配分已定済みで、追加投資が承認されない可能性が高い"
    );

    // 記録数と参照データが一致することを確認
    expect(record_result.recorded_reasons_count).toBe(
      retrieval_result.total_records
    );

    // 次回検討時の参照タイムスタンプが正しく記録されていることを検証
    expect(retrieval_result.retrieval_timestamp).toBe(next_review_date);

    // 過去の判断理由が完全に追跡できることを確認
    expect(retrieval_result.historical_records.length).toBe(3);
    retrieval_result.historical_records.forEach((record, index) => {
      expect(record.record_sequence).toBe(index + 1);
      expect(record.recorded_timestamp).toBe("2024-12-15T14:30:00Z");
      expect(record.recorded_by_user_id).toBe("USER-PM-001");
    });
  });
});