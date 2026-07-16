import { validateDocumentQualityChecklist } from "../../src/logic/it-8-1-1-1";

describe("ドキュメント品質チェック機能", () => {
  // SCEN-330
  test("標準化チェックリストの全項目が満たされた場合にドキュメントが承認される", () => {
    const document_id = "doc-20240115-001";
    const title = "専業主夫層のペイン要因定量抽出と差別化軸根拠付けドキュメント";
    const body_content = "本ドキュメントは専業主夫層の具体的なペイン要因を定量的に抽出し、競合アプリとの差別化軸を根拠付けるものです。";
    const figures_and_charts = [
      {
        chart_id: "fig-001",
        chart_type: "priority_matrix",
        title: "ペイン要因優先度マトリクス（発生頻度 vs 影響度）",
      },
      {
        chart_id: "fig-002",
        chart_type: "comparison_table",
        title: "競合アプリとの機能対応度比較表",
      },
    ];
    const references = [
      {
        ref_id: "ref-001",
        title: "四半期市場分析レポート",
        source_type: "internal_report",
      },
      {
        ref_id: "ref-002",
        title: "ユーザーインタビュー記録（専業主夫層）",
        source_type: "internal_data",
      },
    ];
    const approval_requested_by = "pm-user-123";
    const approval_requested_at = new Date("2024-01-15T10:30:00Z");

    const input = {
      document_id,
      title,
      body_content,
      figures_and_charts,
      references,
      approval_requested_by,
      approval_requested_at,
    };

    const result = validateDocumentQualityChecklist(input);

    // 標準化チェックリスト全項目の検証
    expect(result.checklist_validation_result).toEqual({
      has_title: true,
      has_body_content: true,
      has_figures_and_charts: true,
      has_references: true,
      all_items_satisfied: true,
    });

    // ドキュメント承認ステータスが「承認済み」に更新される
    expect(result.approval_status).toBe("approved");

    // 承認者の情報が記録される
    expect(result.approved_by).toBe(approval_requested_by);

    // 承認日時が記録される（入力された日時と一致）
    expect(result.approval_completed_at).toEqual(approval_requested_at);

    // 承認完了通知メッセージが生成される
    expect(result.approval_notification).toEqual(
      expect.objectContaining({
        notification_type: "document_approved",
        document_id,
        title,
        message: expect.stringMatching(/承認/),
      })
    );

    // 全体の検証結果が success
    expect(result.validation_result).toBe("success");
  });
});