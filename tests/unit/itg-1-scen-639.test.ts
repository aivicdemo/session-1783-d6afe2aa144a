import { determineMarketAnalysisExecution } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-639
  test("市場分析実施可否判定の境界値: 四半期開始日の前日時点では実施判定が『未定』と判定される", () => {
    // 四半期開始日: 2024-01-01
    const q1_start = new Date("2024-01-01T00:00:00Z");
    // 四半期開始日の前日: 2023-12-31
    const day_before_q1_start = new Date("2023-12-31T23:59:59Z");

    const result = determineMarketAnalysisExecution({
      current_date: day_before_q1_start,
      quarter_start_date: q1_start,
    });

    expect(result.execution_status).toBe("undetermined");
    expect(result.should_execute).toBe(false);
    expect(result.reason).toMatch(/四半期開始/);
  });
});