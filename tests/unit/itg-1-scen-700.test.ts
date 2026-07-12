import { defineQuarterlyAnalysisSchedule } from "../../src/logic/it-2";

describe("分析フェーズスケジュール管理機能", () => {
  // SCEN-700
  test("四半期ユーザー行動分析の各フェーズに納期とSLAが正しく設定される", () => {
    const quarter_start_date = new Date("2024-01-01T00:00:00Z");
    const quarter_end_date = new Date("2024-03-31T23:59:59Z");

    const result = defineQuarterlyAnalysisSchedule({
      quarter_start_date,
      quarter_end_date,
    });

    // フェーズ数の検証
    expect(result.phases.length).toBe(4);

    // フェーズ1: データ収集フェーズ
    const data_collection_phase = result.phases[0];
    expect(data_collection_phase.phase_name).toBe("データ収集フェーズ");
    expect(data_collection_phase.start_date).toEqual(
      new Date("2024-01-01T00:00:00Z")
    );
    expect(data_collection_phase.due_date).toEqual(
      new Date("2024-01-21T23:59:59Z")
    );
    expect(data_collection_phase.sla_hours).toBe(504); // 21日 * 24時間

    // フェーズ2: 分析フェーズ
    const analysis_phase = result.phases[1];
    expect(analysis_phase.phase_name).toBe("分析フェーズ");
    expect(analysis_phase.start_date).toEqual(
      new Date("2024-01-22T00:00:00Z")
    );
    expect(analysis_phase.due_date).toEqual(new Date("2024-03-03T23:59:59Z"));
    expect(analysis_phase.sla_hours).toBe(408); // 17日 * 24時間

    // フェーズ3: レポート作成フェーズ
    const report_phase = result.phases[2];
    expect(report_phase.phase_name).toBe("レポート作成フェーズ");
    expect(report_phase.start_date).toEqual(
      new Date("2024-03-04T00:00:00Z")
    );
    expect(report_phase.due_date).toEqual(new Date("2024-03-17T23:59:59Z"));
    expect(report_phase.sla_hours).toBe(336); // 14日 * 24時間

    // フェーズ4: 承認フェーズ
    const approval_phase = result.phases[3];
    expect(approval_phase.phase_name).toBe("承認フェーズ");
    expect(approval_phase.start_date).toEqual(
      new Date("2024-03-18T00:00:00Z")
    );
    expect(approval_phase.due_date).toEqual(new Date("2024-03-31T23:59:59Z"));
    expect(approval_phase.sla_hours).toBe(336); // 14日 * 24時間

    // フェーズ間の納期順序検証
    expect(data_collection_phase.due_date.getTime()).toBeLessThan(
      analysis_phase.start_date.getTime()
    );
    expect(analysis_phase.due_date.getTime()).toBeLessThan(
      report_phase.start_date.getTime()
    );
    expect(report_phase.due_date.getTime()).toBeLessThan(
      approval_phase.start_date.getTime()
    );

    // 全フェーズ完了日が四半期終了日以前であることを確認
    expect(approval_phase.due_date.getTime()).toBeLessThanOrEqual(
      quarter_end_date.getTime()
    );

    // 全体スケジュール完全性の確認
    expect(result.total_duration_days).toBe(91);
    expect(result.schedule_status).toBe("定義完了");
  });
});