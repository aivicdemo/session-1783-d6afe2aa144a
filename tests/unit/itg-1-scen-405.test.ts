import { detectPainAnalysisStatus } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-405: [normal] ペイン分析・優先度マトリクス生成機能 - 生成途中で離脱した場合と却下時のペイン要因分類が区別される
  test("生成途中の離脱と却下されたペイン分析が異なるステータスで分類される", () => {
    const abandoned_analysis = {
      analysis_id: "PA-2024-001",
      user_id: "USR-0001",
      pain_factors: ["調理時間制限", "予算制約"],
      progress_percent: 50,
      status: "in_progress",
      abandoned_at: new Date("2024-01-15T14:30:00Z"),
      completed_at: null,
    };

    const rejected_analysis = {
      analysis_id: "PA-2024-002",
      user_id: "USR-0001",
      pain_factors: ["食材制限", "栄養バランス", "調理時間制限"],
      progress_percent: 100,
      status: "completed",
      abandoned_at: null,
      completed_at: new Date("2024-01-15T15:00:00Z"),
      rejection_reason: "不適切な分類",
      rejected_at: new Date("2024-01-15T15:30:00Z"),
    };

    const result_abandoned = detectPainAnalysisStatus(abandoned_analysis);
    const result_rejected = detectPainAnalysisStatus(rejected_analysis);

    expect(result_abandoned.status).toBe("abandoned");
    expect(result_abandoned.classification_type).toBe("in_progress");
    expect(result_abandoned.progress_percent).toBe(50);
    expect(result_abandoned.is_abandoned).toBe(true);
    expect(result_abandoned.is_rejected).toBe(false);

    expect(result_rejected.status).toBe("rejected");
    expect(result_rejected.classification_type).toBe("rejected");
    expect(result_rejected.progress_percent).toBe(100);
    expect(result_rejected.is_abandoned).toBe(false);
    expect(result_rejected.is_rejected).toBe(true);
    expect(result_rejected.rejection_reason).toBe("不適切な分類");

    expect(result_abandoned.status).not.toBe(result_rejected.status);
    expect(result_abandoned.classification_type).not.toBe(
      result_rejected.classification_type
    );

    const history = {
      analyses: [result_abandoned, result_rejected],
    };

    expect(history.analyses).toHaveLength(2);
    expect(history.analyses[0].status).toBe("abandoned");
    expect(history.analyses[1].status).toBe("rejected");

    const abandoned_count = history.analyses.filter(
      (a) => a.classification_type === "in_progress"
    ).length;
    const rejected_count = history.analyses.filter(
      (a) => a.classification_type === "rejected"
    ).length;

    expect(abandoned_count).toBe(1);
    expect(rejected_count).toBe(1);
  });
});