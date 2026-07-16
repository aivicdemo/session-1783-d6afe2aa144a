import { extractUsageFrequencyAndDropoffPoints } from "../../src/logic/it-8-1-2-1";

describe("機能別使用頻度・離脱ポイント抽出機能", () => {
  // SCEN-281
  test("離脱ポイント情報が欠損しているログレコードが抽出処理中にエラーを引き起こす", () => {
    const incompleteLogRecords = [
      {
        log_id: "log_001",
        user_id: "user_001",
        feature_name: "献立生成",
        action_type: "open",
        timestamp: new Date("2024-01-15T09:00:00Z"),
        session_id: "session_001",
        dropoff_point: "メニュー選択画面",
      },
      {
        log_id: "log_002",
        user_id: "user_001",
        feature_name: "献立生成",
        action_type: "abandon",
        timestamp: new Date("2024-01-15T09:05:00Z"),
        session_id: "session_001",
        dropoff_point: null,
      },
      {
        log_id: "log_003",
        user_id: "user_001",
        feature_name: "食材選択",
        action_type: "abandon",
        timestamp: new Date("2024-01-15T09:10:00Z"),
        session_id: "session_001",
        dropoff_point: undefined,
      },
      {
        log_id: "log_004",
        user_id: "user_002",
        feature_name: "予算設定",
        action_type: "close",
        timestamp: new Date("2024-01-15T09:15:00Z"),
        session_id: "session_002",
        dropoff_point: "予算入力フォーム",
      },
    ];

    const result = () =>
      extractUsageFrequencyAndDropoffPoints(incompleteLogRecords);

    expect(result).toThrow(/離脱ポイント/);
  });
});