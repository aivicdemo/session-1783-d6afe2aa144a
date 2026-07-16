import { analyzeMenuGenerationFlowDropoffs } from "../../src/logic/it-1-br-8-2-2-1";

describe("献立生成フロー離脱ポイント抽出・分析機能", () => {
  // SCEN-319
  test("ログデータにタイムスタンプが欠落している場合、データ品質エラーが報告される", () => {
    const logDataWithMissingTimestamp = [
      {
        userId: "user_001",
        sessionId: "session_abc123",
        // timestampが欠落
        flowStep: "ingredient_selection",
        action: "view",
        recordId: "log_rec_001",
      },
      {
        userId: "user_001",
        sessionId: "session_abc123",
        timestamp: new Date("2024-01-15T10:30:00Z"),
        flowStep: "cooking_time_check",
        action: "submit",
        recordId: "log_rec_002",
      },
    ];

    expect(() => {
      analyzeMenuGenerationFlowDropoffs(logDataWithMissingTimestamp as any);
    }).toThrow(/タイムスタンプ/);
  });
});