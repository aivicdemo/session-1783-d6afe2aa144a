import { classifyAndAggregateRejectReasons } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計", () => {
  // SCEN-852
  test("理由テキストがいずれのカテゴリにも該当しない場合、分類エラーが発生して手動レビューキューに送信される", () => {
    const unclassifiableReasonText = "不明な理由XYZ123";
    const reasonRecordId = "reason_001";
    const timestamp = new Date("2024-01-15T11:00:00Z");

    const input = {
      reasonText: unclassifiableReasonText,
      recordId: reasonRecordId,
      submittedAt: timestamp,
    };

    const result = classifyAndAggregateRejectReasons(input);

    // 分類エラーが発生したことを確認
    expect(result.classificationStatus).toBe("ERROR");

    // 手動レビューキューにエラーレコードが追加されたことを確認
    expect(result.manualReviewQueueEntry).toBeDefined();
    expect(result.manualReviewQueueEntry.recordId).toBe(reasonRecordId);
    expect(result.manualReviewQueueEntry.originalText).toBe(unclassifiableReasonText);

    // 手動レビューキューのステータスが『保留中』に設定されていることを確認
    expect(result.manualReviewQueueEntry.status).toBe("保留中");

    // エラーログに該当テキストと『カテゴリ分類失敗』メッセージが記録されていることを確認
    expect(result.errorLog).toBeDefined();
    expect(result.errorLog.message).toMatch(/カテゴリ分類失敗/);
    expect(result.errorLog.reasonText).toBe(unclassifiableReasonText);
    expect(result.errorLog.timestamp).toEqual(timestamp);

    // 分類結果がnullであることを確認（カテゴリ不該当）
    expect(result.classifiedCategory).toBeNull();

    // 集計データが空であることを確認（分類失敗のため集計されない）
    expect(result.aggregationResult).toEqual({
      totalRecords: 0,
      categoryCounts: {},
    });
  });
});