import { prioritizeAndNotifyImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-353: [edge] 改善提案の優先度付けと定期通知 - 改善提案が0件の場合、通知は送信されず、スキップ記録が残される
  test("改善提案が0件の場合、通知は送信されず、スキップ記録がタイムスタンプ付きで記録される", () => {
    const input = {
      improvement_proposals: [],
      notification_triggered_at: new Date("2024-06-15T14:00:00Z"),
      system_user_id: "dev-team-001",
    };

    const result = prioritizeAndNotifyImprovementProposals(input);

    expect(result.notification_sent).toBe(false);
    expect(result.notification_log_entry).toBeUndefined();
    expect(result.skip_log_entry).toBeDefined();
    expect(result.skip_log_entry?.skip_reason).toBe("改善提案0件");
    expect(result.skip_log_entry?.timestamp).toEqual(
      new Date("2024-06-15T14:00:00Z")
    );
    expect(result.skip_log_entry?.system_error_occurred).toBe(false);
  });
});