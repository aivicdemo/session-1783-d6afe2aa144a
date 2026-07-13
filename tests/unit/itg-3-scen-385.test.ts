import { analyzeFeatureUsagePattern } from "../../src/logic/it-1";

describe("月次食費実績の超過要因分析機能", () => {
  // SCEN-385
  test("利用ログが空の場合にエラーハンドリングが機能する", () => {
    const empty_usage_logs = [];
    const analysis_date = "2024-01-31T23:59:59Z";

    expect(() =>
      analyzeFeatureUsagePattern({
        usage_logs: empty_usage_logs,
        analysis_date: analysis_date,
      })
    ).toThrow(/利用ログ/);
  });
});